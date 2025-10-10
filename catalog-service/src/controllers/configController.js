const { dynamoDB, tableName } = require('../config/dynamodb');

/**
 * Crear configuración de computadora
 * POST /api/configs
 */
exports.createConfig = async (req, res) => {
  try {
    const { id, name, price, description, components } = req.body;

    // Validar datos requeridos
    if (!id || !name || !price || !components || components.length === 0) {
      return res.status(400).json({ 
        error: 'Faltan campos requeridos: id, name, price, components' 
      });
    }

    // 1. Crear metadata de la configuración
    const configMetadata = {
      TableName: tableName,
      Item: {
        PK: `CONFIG#${id}`,
        SK: 'METADATA',
        Type: 'config',
        name,
        price,
        description: description || '',
        createdAt: new Date().toISOString()
      }
    };

    await dynamoDB.put(configMetadata).promise();

    // 2. Crear las composiciones (componentes que conforman esta configuración)
    for (const comp of components) {
      const compositionParams = {
        TableName: tableName,
        Item: {
          PK: `CONFIG#${id}`,
          SK: `COMPONENT#${comp.componentId}`,
          Type: 'composition',
          quantity: comp.quantity
        }
      };
      await dynamoDB.put(compositionParams).promise();
    }

    res.status(201).json({ 
      success: true,
      message: 'Configuración creada exitosamente', 
      config: { 
        id, 
        name, 
        price,
        description,
        components 
      } 
    });
  } catch (error) {
    console.error('Error al crear configuración:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Obtener todas las configuraciones
 * GET /api/configs
 */
exports.getAllConfigs = async (req, res) => {
  try {
    const params = {
      TableName: tableName,
      FilterExpression: '#type = :configType AND SK = :metadata',
      ExpressionAttributeNames: {
        '#type': 'Type'
      },
      ExpressionAttributeValues: {
        ':configType': 'config',
        ':metadata': 'METADATA'
      }
    };

    const result = await dynamoDB.scan(params).promise();
    
    res.json({ 
      success: true,
      count: result.Items.length,
      configs: result.Items 
    });
  } catch (error) {
    console.error('Error al obtener configuraciones:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Obtener configuración por ID con sus componentes
 * GET /api/configs/:id
 */
exports.getConfigById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const params = {
      TableName: tableName,
      KeyConditionExpression: 'PK = :pk',
      ExpressionAttributeValues: {
        ':pk': `CONFIG#${id}`
      }
    };

    const result = await dynamoDB.query(params).promise();
    
    if (result.Items.length === 0) {
      return res.status(404).json({ 
        success: false,
        error: 'Configuración no encontrada' 
      });
    }

    // Separar metadata de componentes
    const metadata = result.Items.find(item => item.SK === 'METADATA');
    const components = result.Items.filter(item => item.Type === 'composition');

    res.json({ 
      success: true,
      config: metadata, 
      components: components.map(c => ({
        componentId: c.SK.replace('COMPONENT#', ''),
        quantity: c.quantity
      }))
    });
  } catch (error) {
    console.error('Error al obtener configuración:', error);
    res.status(500).json({ error: error.message });
  }
};