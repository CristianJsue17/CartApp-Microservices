const { dynamoDB, tableName } = require('../config/dynamodb');
const { v4: uuidv4 } = require('uuid');

/**
 * Crear orden y descontar stock de componentes automáticamente
 * POST /api/orders
 * Body: { userId, configId, quantity }
 * 
 * Este endpoint:
 * 1. Crea la orden de UNA computadora
 * 2. Obtiene los componentes de esa computadora
 * 3. Descuenta el stock de cada componente automáticamente
 */
exports.createOrder = async (req, res) => {
  try {
    const { userId, configId, quantity } = req.body;
    
    // Validar datos requeridos
    if (!userId || !configId || !quantity) {
      return res.status(400).json({ 
        error: 'Faltan campos requeridos: userId, configId, quantity' 
      });
    }

    if (quantity <= 0) {
      return res.status(400).json({ 
        error: 'La cantidad debe ser mayor a 0' 
      });
    }

    // Obtener el precio y nombre de la configuración desde DynamoDB
    const configParams = {
      TableName: tableName,
      Key: {
        PK: `CONFIG#${configId}`,
        SK: 'METADATA'
      }
    };

    const configResult = await dynamoDB.get(configParams).promise();
    
    if (!configResult.Item) {
      return res.status(404).json({ 
        success: false,
        error: 'Configuración no encontrada' 
      });
    }

    const configPrice = configResult.Item.price;
    const configName = configResult.Item.name;
    const total = configPrice * quantity;

    // Generar ID único para la orden
    const orderId = uuidv4();

    console.log(`\n🛒 Iniciando orden ${orderId}`);
    console.log(`📱 Usuario: ${userId}`);
    console.log(`💻 Computadora: ${configName}`);
    console.log(`📊 Cantidad: ${quantity}`);
    console.log(`💰 Total: $${total.toFixed(2)}\n`);

    // 1. Crear metadata de la orden
    const orderMetadata = {
      TableName: tableName,
      Item: {
        PK: `USER#${userId}`,
        SK: `ORDER#${orderId}`,
        Type: 'order',
        orderId,
        userId,
        configId,
        configName,
        quantity,
        totalPrice: total,
        status: 'completed',
        createdAt: new Date().toISOString()
      }
    };
    await dynamoDB.put(orderMetadata).promise();

    console.log(`✅ Orden registrada en la base de datos`);

    // 2. Obtener componentes de la configuración
    const componentsParams = {
      TableName: tableName,
      KeyConditionExpression: 'PK = :pk',
      ExpressionAttributeValues: {
        ':pk': `CONFIG#${configId}`
      }
    };
    
    const componentsResult = await dynamoDB.query(componentsParams).promise();
    const components = componentsResult.Items.filter(c => c.Type === 'composition');

    if (components.length === 0) {
      return res.status(400).json({ 
        success: false,
        error: `La configuración ${configId} no tiene componentes definidos` 
      });
    }

    console.log(`🔍 Componentes encontrados: ${components.length}\n`);

    // Array para almacenar componentes reservados
    const componentsReserved = [];

    // 3. Descontar stock de cada componente
    for (const comp of components) {
      const componentId = comp.SK.replace('COMPONENT#', '');
      const requiredQty = comp.quantity * quantity; // cantidad por config * cantidad de configs compradas

      console.log(`📦 Procesando: ${componentId}`);
      console.log(`   Cantidad requerida: ${requiredQty} unidades`);

      // Usar UpdateExpression con ConditionExpression para descuento atómico
      const updateParams = {
        TableName: tableName,
        Key: {
          PK: `COMPONENT#${componentId}`,
          SK: 'METADATA'
        },
        UpdateExpression: 'SET stock = stock - :qty, updatedAt = :updatedAt',
        ConditionExpression: 'stock >= :qty', // Solo descuenta si hay suficiente stock
        ExpressionAttributeValues: {
          ':qty': requiredQty,
          ':updatedAt': new Date().toISOString()
        },
        ReturnValues: 'ALL_NEW'
      };

      try {
        const updateResult = await dynamoDB.update(updateParams).promise();
        
        componentsReserved.push({
          componentId: componentId,
          componentName: updateResult.Attributes.name,
          quantityUsed: requiredQty,
          stockBefore: updateResult.Attributes.stock + requiredQty,
          stockAfter: updateResult.Attributes.stock,
          pricePerUnit: updateResult.Attributes.price
        });

        console.log(`   ✅ Stock descontado exitosamente`);
        console.log(`   📉 Stock anterior: ${updateResult.Attributes.stock + requiredQty}`);
        console.log(`   📊 Stock actual: ${updateResult.Attributes.stock}\n`);

      } catch (error) {
        // Si falla el descuento (stock insuficiente)
        if (error.code === 'ConditionalCheckFailedException') {
          console.error(`   ❌ Stock insuficiente para ${componentId}\n`);
          
          // Obtener stock actual para mostrar en el error
          const stockCheckParams = {
            TableName: tableName,
            Key: {
              PK: `COMPONENT#${componentId}`,
              SK: 'METADATA'
            }
          };
          const stockCheck = await dynamoDB.get(stockCheckParams).promise();
          const currentStock = stockCheck.Item ? stockCheck.Item.stock : 0;
          
          return res.status(400).json({ 
            success: false,
            error: 'Stock insuficiente', 
            component: stockCheck.Item ? stockCheck.Item.name : componentId,
            required: requiredQty,
            available: currentStock,
            message: `No hay suficiente stock de "${stockCheck.Item ? stockCheck.Item.name : componentId}". Necesitas ${requiredQty} unidades pero solo hay ${currentStock} disponibles.`
          });
        }
        throw error; // Re-lanzar otros errores
      }
    }

    // 4. Crear registro de componentes usados (para auditoría)
    const componentsRecordParams = {
      TableName: tableName,
      Item: {
        PK: `USER#${userId}`,
        SK: `ORDER#${orderId}#COMPONENTS`,
        Type: 'order_components',
        orderId,
        components: componentsReserved,
        createdAt: new Date().toISOString()
      }
    };
    await dynamoDB.put(componentsRecordParams).promise();

    console.log(`🎉 Orden ${orderId} completada exitosamente`);
    console.log(`═══════════════════════════════════════════════\n`);

    res.status(201).json({ 
      success: true,
      message: `Orden creada exitosamente. Se compraron ${quantity} unidad(es) de ${configName}`,
      order: {
        orderId,
        userId,
        configId,
        configName,
        quantity,
        totalPrice: total,
        status: 'completed',
        componentsUsed: componentsReserved,
        createdAt: new Date().toISOString()
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

    // Scan para buscar la orden (ya que ahora PK es USER#userId)
    const params = {
      TableName: tableName,
      FilterExpression: 'orderId = :orderId AND #type = :orderType',
      ExpressionAttributeNames: {
        '#type': 'Type'
      },
      ExpressionAttributeValues: {
        ':orderId': orderId,
        ':orderType': 'order'
      }
    };

    const result = await dynamoDB.scan(params).promise();

    if (result.Items.length === 0) {
      return res.status(404).json({ 
        success: false,
        error: 'Orden no encontrada' 
      });
    }

    const order = result.Items[0];

    // Buscar componentes usados
    const componentsParams = {
      TableName: tableName,
      FilterExpression: 'orderId = :orderId AND #type = :compType',
      ExpressionAttributeNames: {
        '#type': 'Type'
      },
      ExpressionAttributeValues: {
        ':orderId': orderId,
        ':compType': 'order_components'
      }
    };

    const componentsResult = await dynamoDB.scan(componentsParams).promise();
    const components = componentsResult.Items[0] ? componentsResult.Items[0].components : [];

    res.json({ 
      success: true,
      order,
      componentsUsed: components
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
      FilterExpression: '#type = :orderType',
      ExpressionAttributeNames: {
        '#type': 'Type'
      },
      ExpressionAttributeValues: {
        ':orderType': 'order'
      }
    };

    const result = await dynamoDB.scan(params).promise();
    
    res.json({ 
      success: true,
      count: result.Items.length,
      orders: result.Items.sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt) // Ordenar por fecha descendente
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
      KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
      ExpressionAttributeValues: {
        ':pk': `USER#${userId}`,
        ':sk': 'ORDER#'
      }
    };

    const result = await dynamoDB.query(params).promise();
    
    // Filtrar solo las órdenes (no los componentes)
    const orders = result.Items.filter(item => item.Type === 'order');

    res.json({ 
      success: true,
      userId,
      count: orders.length,
      orders: orders.sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
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