const { dynamoDB, tableName } = require('../config/dynamodb');
const axios = require('axios');

/**
 * Agregar item al carrito
 * POST /api/cart/add
 * 
 * Este endpoint simula agregar al carrito (en memoria).
 * En producción podrías guardar en DB con PK: USER#userId, SK: CART#configId
 */
exports.addToCart = async (req, res) => {
  try {
    const { configId, quantity } = req.body;
    
    // ⭐ CAMBIO: userId viene del JWT (req.user), NO del body
    const userId = req.user.userId;  // Viene del middleware authenticateToken
    const userEmail = req.user.email;

    // Validar datos requeridos
    if (!configId || !quantity) {
      return res.status(400).json({ 
        error: 'Faltan campos requeridos: configId, quantity' 
      });
    }

    if (quantity <= 0) {
      return res.status(400).json({ 
        error: 'La cantidad debe ser mayor a 0' 
      });
    }

    // Verificar que la configuración existe llamando al Catalog Service
    try {
      const configResponse = await axios.get(
        `${process.env.CATALOG_SERVICE_URL}/api/configs/${configId}`
      );

      if (!configResponse.data.config) {
        return res.status(404).json({ 
          error: 'Configuración no encontrada' 
        });
      }

      const configData = configResponse.data;

      // ⭐ Log mejorado con información del usuario
      console.log(`✅ Usuario ${userEmail} agregó ${quantity}x ${configData.config.name} al carrito`);

      res.json({ 
        success: true,
        message: 'Item agregado al carrito exitosamente', 
        cart: { 
          userId,           // ⭐ userId del JWT
          userEmail,        // ⭐ Información adicional
          configId, 
          quantity, 
          config: configData.config,
          components: configData.components
        }
      });

    } catch (error) {
      if (error.response && error.response.status === 404) {
        return res.status(404).json({ 
          error: 'Configuración no encontrada en el catálogo' 
        });
      }
      throw error;
    }

  } catch (error) {
    console.error('Error al agregar al carrito:', error);
    res.status(500).json({ 
      error: 'Error al agregar al carrito',
      message: error.message 
    });
  }
};

/**
 * Verificar disponibilidad de componentes para una configuración
 * POST /api/cart/check-availability
 * 
 * Verifica si hay suficiente stock de todos los componentes
 * necesarios para ensamblar X cantidad de una configuración
 */
exports.checkAvailability = async (req, res) => {
  try {
    const { configId, quantity } = req.body;

    // Validar datos requeridos
    if (!configId || !quantity) {
      return res.status(400).json({ 
        error: 'Faltan campos requeridos: configId, quantity' 
      });
    }

    if (quantity <= 0) {
      return res.status(400).json({ 
        error: 'La cantidad debe ser mayor a 0' 
      });
    }

    // Obtener la configuración y sus componentes desde DynamoDB
    const params = {
      TableName: tableName,
      KeyConditionExpression: 'PK = :pk',
      ExpressionAttributeValues: {
        ':pk': `CONFIG#${configId}`
      }
    };

    const result = await dynamoDB.query(params).promise();
    
    if (result.Items.length === 0) {
      return res.status(404).json({ 
        error: 'Configuración no encontrada' 
      });
    }

    // Filtrar solo los componentes (composiciones)
    const components = result.Items.filter(item => item.Type === 'composition');

    if (components.length === 0) {
      return res.status(400).json({ 
        error: 'La configuración no tiene componentes definidos' 
      });
    }

    // Verificar stock de cada componente
    const availability = [];
    
    for (const comp of components) {
      const componentId = comp.SK.replace('COMPONENT#', '');
      const requiredQty = comp.quantity * quantity;

      // Obtener stock actual del componente desde DynamoDB
      const stockParams = {
        TableName: tableName,
        Key: {
          PK: `COMPONENT#${componentId}`,
          SK: 'METADATA'
        }
      };

      const stockResult = await dynamoDB.get(stockParams).promise();
      
      if (!stockResult.Item) {
        availability.push({
          componentId,
          componentName: 'Desconocido',
          required: requiredQty,
          available: 0,
          sufficient: false,
          missing: requiredQty
        });
        continue;
      }

      const currentStock = stockResult.Item.stock || 0;
      const isSufficient = currentStock >= requiredQty;

      availability.push({
        componentId,
        componentName: stockResult.Item.name,
        required: requiredQty,
        available: currentStock,
        sufficient: isSufficient,
        missing: isSufficient ? 0 : requiredQty - currentStock
      });
    }

    // Verificar si todos los componentes tienen stock suficiente
    const allAvailable = availability.every(item => item.sufficient);
    const insufficientItems = availability.filter(item => !item.sufficient);

    // ⭐ Log mejorado
    console.log(`✅ Usuario ${req.user.email} verificó disponibilidad: ${configId} x${quantity} - ${allAvailable ? 'Disponible' : 'No disponible'}`);

    res.json({ 
      success: true,
      available: allAvailable,
      configId,
      requestedQuantity: quantity,
      details: availability,
      insufficientComponents: insufficientItems.length > 0 ? insufficientItems : null,
      message: allAvailable 
        ? 'Stock suficiente para todos los componentes' 
        : `Stock insuficiente para ${insufficientItems.length} componente(s)`
    });

  } catch (error) {
    console.error('Error al verificar disponibilidad:', error);
    res.status(500).json({ 
      error: 'Error al verificar disponibilidad',
      message: error.message 
    });
  }
};