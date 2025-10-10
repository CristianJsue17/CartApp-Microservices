const { dynamoDB, tableName } = require('../config/dynamodb');

/**
 * Crear un nuevo componente
 * POST /api/components
 */
exports.createComponent = async (req, res) => {
  try {
    const { id, name, stock, price, specs } = req.body;
    
    const params = {
      TableName: tableName,
      Item: {
        PK: `COMPONENT#${id}`,
        SK: 'METADATA',
        Type: 'component',
        name,
        stock,
        price,
        specs,
        createdAt: new Date().toISOString()
      }
    };

    await dynamoDB.put(params).promise();
    
    res.status(201).json({ 
      message: 'Componente creado exitosamente', 
      component: params.Item 
    });
  } catch (error) {
    console.error('Error al crear componente:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Obtener todos los componentes
 * GET /api/components
 */
exports.getAllComponents = async (req, res) => {
  try {
    const params = {
      TableName: tableName,
      FilterExpression: '#type = :componentType AND SK = :metadata',
      ExpressionAttributeNames: {
        '#type': 'Type'
      },
      ExpressionAttributeValues: {
        ':componentType': 'component',
        ':metadata': 'METADATA'
      }
    };

    const result = await dynamoDB.scan(params).promise();
    
    res.json({ 
      success: true,
      count: result.Items.length,
      components: result.Items 
    });
  } catch (error) {
    console.error('Error al obtener componentes:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Obtener componente por ID
 * GET /api/components/:id
 */
exports.getComponentById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const params = {
      TableName: tableName,
      Key: {
        PK: `COMPONENT#${id}`,
        SK: 'METADATA'
      }
    };

    const result = await dynamoDB.get(params).promise();
    
    if (!result.Item) {
      return res.status(404).json({ 
        success: false,
        error: 'Componente no encontrado' 
      });
    }

    res.json({ 
      success: true,
      component: result.Item 
    });
  } catch (error) {
    console.error('Error al obtener componente:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Actualizar stock del componente
 * PATCH /api/components/:id/stock
 */
exports.updateComponentStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { stock } = req.body;

    if (stock === undefined || stock < 0) {
      return res.status(400).json({ 
        error: 'El stock debe ser un número mayor o igual a 0' 
      });
    }

    const params = {
      TableName: tableName,
      Key: {
        PK: `COMPONENT#${id}`,
        SK: 'METADATA'
      },
      UpdateExpression: 'SET stock = :stock, updatedAt = :updatedAt',
      ExpressionAttributeValues: {
        ':stock': stock,
        ':updatedAt': new Date().toISOString()
      },
      ReturnValues: 'ALL_NEW'
    };

    const result = await dynamoDB.update(params).promise();
    
    res.json({ 
      success: true,
      message: 'Stock actualizado exitosamente', 
      component: result.Attributes 
    });
  } catch (error) {
    console.error('Error al actualizar stock:', error);
    res.status(500).json({ error: error.message });
  }
};