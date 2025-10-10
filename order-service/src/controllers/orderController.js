const { dynamoDB, tableName } = require('../config/dynamodb');
const { v4: uuidv4 } = require('uuid');

/**
 * Crear orden y descontar stock de componentes automáticamente
 * POST /api/orders
 * 
 * Este es el endpoint más importante del sistema:
 * 1. Crea la orden
 * 2. Por cada configuración comprada, obtiene sus componentes
 * 3. Descuenta el stock de cada componente (usando transacciones atómicas)
 * 4. Crea un registro de reserva con los componentes descontados
 */
exports.createOrder = async (req, res) => {
  try {
    const { userId, items } = req.body; // items: [{ configId, quantity, price }]
    
    // Validar datos requeridos
    if (!userId || !items || items.length === 0) {
      return res.status(400).json({ 
        error: 'Faltan campos requeridos: userId, items' 
      });
    }

    // Generar ID único para la orden
    const orderId = uuidv4();
    const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    // 1. Crear metadata de la orden
    const orderMetadata = {
      TableName: tableName,
      Item: {
        PK: `ORDER#${orderId}`,
        SK: 'METADATA',
        Type: 'order',
        userId,
        total,
        status: 'pending',
        date: new Date().toISOString(),
        itemCount: items.length
      }
    };
    await dynamoDB.put(orderMetadata).promise();

    console.log(`✅ Orden creada: ${orderId}`);

    // 2. Procesar cada item de la orden
    for (let i = 0; i < items.length; i++) {
      const item = items[i];

      // Validar item
      if (!item.configId || !item.quantity || !item.price) {
        throw new Error(`Item ${i + 1} inválido: falta configId, quantity o price`);
      }

      // Guardar item de orden
      const orderItem = {
        TableName: tableName,
        Item: {
          PK: `ORDER#${orderId}`,
          SK: `ITEM#${i + 1}`,
          Type: 'order_item',
          configId: item.configId,
          quantity: item.quantity,
          price: item.price,
          subtotal: item.price * item.quantity
        }
      };
      await dynamoDB.put(orderItem).promise();

      console.log(`📝 Item ${i + 1} guardado: ${item.configId} x${item.quantity}`);

      // Obtener componentes de la configuración desde DynamoDB
      const configParams = {
        TableName: tableName,
        KeyConditionExpression: 'PK = :pk',
        ExpressionAttributeValues: {
          ':pk': `CONFIG#${item.configId}`
        }
      };
      
      const configResult = await dynamoDB.query(configParams).promise();
      const components = configResult.Items.filter(c => c.Type === 'composition');

      if (components.length === 0) {
        throw new Error(`La configuración ${item.configId} no tiene componentes definidos`);
      }

      console.log(`🔍 Componentes encontrados para ${item.configId}: ${components.length}`);

      // Array para almacenar componentes reservados
      const componentsToReserve = [];

      // 3. Descontar stock de cada componente
      for (const comp of components) {
        const componentId = comp.SK.replace('COMPONENT#', '');
        const requiredQty = comp.quantity * item.quantity; // cantidad por config * cantidad de configs

        console.log(`📦 Descontando ${requiredQty} unidades de ${componentId}...`);

        // Usar UpdateExpression con ConditionExpression para descuento atómico
        const updateParams = {
          TableName: tableName,
          Key: {
            PK: `COMPONENT#${componentId}`,
            SK: 'METADATA'
          },
          UpdateExpression: 'SET stock = stock - :qty',
          ConditionExpression: 'stock >= :qty', // Solo descuenta si hay suficiente stock
          ExpressionAttributeValues: {
            ':qty': requiredQty
          },
          ReturnValues: 'ALL_NEW'
        };

        try {
          const updateResult = await dynamoDB.update(updateParams).promise();
          
          componentsToReserve.push({
            id: componentId,
            name: updateResult.Attributes.name,
            qtyReserved: requiredQty,
            newStock: updateResult.Attributes.stock
          });

          console.log(`✅ Stock descontado: ${componentId} - Nuevo stock: ${updateResult.Attributes.stock}`);

        } catch (error) {
          // Si falla el descuento (stock insuficiente), revertir la orden
          if (error.code === 'ConditionalCheckFailedException') {
            console.error(`❌ Stock insuficiente para ${componentId}`);
            
            // Aquí podrías implementar rollback de la orden
            return res.status(400).json({ 
              success: false,
              error: 'Stock insuficiente', 
              component: componentId,
              required: requiredQty,
              message: `No hay suficiente stock del componente ${componentId}. Se requieren ${requiredQty} unidades.`
            });
          }
          throw error; // Re-lanzar otros errores
        }
      }

      // 4. Crear registro de reserva (tracking de qué se descontó)
      const reservationId = `R-${uuidv4().substring(0, 8).toUpperCase()}`;
      const reservationParams = {
        TableName: tableName,
        Item: {
          PK: `ORDER#${orderId}`,
          SK: `RESERVATION#${reservationId}`,
          Type: 'reservation',
          configId: item.configId,
          components: componentsToReserve,
          status: 'reserved',
          createdAt: new Date().toISOString()
        }
      };
      await dynamoDB.put(reservationParams).promise();

      console.log(`🎫 Reserva creada: ${reservationId}`);
    }

    console.log(`🎉 Orden ${orderId} completada exitosamente`);

    res.status(201).json({ 
      success: true,
      message: 'Orden creada exitosamente y stock descontado',
      order: {
        orderId,
        userId,
        total,
        status: 'pending',
        itemCount: items.length,
        date: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Error al crear orden:', error);
    res.status(500).json({ 
      success: false,
      error: 'Error al crear orden',
      message: error.message 
    });
  }
};

/**
 * Obtener orden por ID con todos sus detalles
 * GET /api/orders/:orderId
 */
exports.getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;

    // Query para obtener todos los registros de la orden
    const params = {
      TableName: tableName,
      KeyConditionExpression: 'PK = :pk',
      ExpressionAttributeValues: {
        ':pk': `ORDER#${orderId}`
      }
    };

    const result = await dynamoDB.query(params).promise();

    if (result.Items.length === 0) {
      return res.status(404).json({ 
        success: false,
        error: 'Orden no encontrada' 
      });
    }

    // Separar por tipo de registro
    const metadata = result.Items.find(item => item.SK === 'METADATA');
    const items = result.Items.filter(item => item.Type === 'order_item');
    const reservations = result.Items.filter(item => item.Type === 'reservation');

    res.json({ 
      success: true,
      order: metadata,
      items,
      reservations
    });

  } catch (error) {
    console.error('Error al obtener orden:', error);
    res.status(500).json({ 
      success: false,
      error: 'Error al obtener orden',
      message: error.message 
    });
  }
};

/**
 * Obtener todas las órdenes
 * GET /api/orders
 */
exports.getAllOrders = async (req, res) => {
  try {
    const params = {
      TableName: tableName,
      FilterExpression: '#type = :orderType AND SK = :metadata',
      ExpressionAttributeNames: {
        '#type': 'Type'
      },
      ExpressionAttributeValues: {
        ':orderType': 'order',
        ':metadata': 'METADATA'
      }
    };

    const result = await dynamoDB.scan(params).promise();
    
    res.json({ 
      success: true,
      count: result.Items.length,
      orders: result.Items.sort((a, b) => 
        new Date(b.date) - new Date(a.date) // Ordenar por fecha descendente
      )
    });

  } catch (error) {
    console.error('Error al obtener órdenes:', error);
    res.status(500).json({ 
      success: false,
      error: 'Error al obtener órdenes',
      message: error.message 
    });
  }
};

/**
 * Obtener órdenes por usuario
 * GET /api/orders/user/:userId
 */
exports.getOrdersByUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const params = {
      TableName: tableName,
      FilterExpression: '#type = :orderType AND SK = :metadata AND userId = :userId',
      ExpressionAttributeNames: {
        '#type': 'Type'
      },
      ExpressionAttributeValues: {
        ':orderType': 'order',
        ':metadata': 'METADATA',
        ':userId': userId
      }
    };

    const result = await dynamoDB.scan(params).promise();
    
    res.json({ 
      success: true,
      userId,
      count: result.Items.length,
      orders: result.Items.sort((a, b) => 
        new Date(b.date) - new Date(a.date)
      )
    });

  } catch (error) {
    console.error('Error al obtener órdenes del usuario:', error);
    res.status(500).json({ 
      success: false,
      error: 'Error al obtener órdenes del usuario',
      message: error.message 
    });
  }
};