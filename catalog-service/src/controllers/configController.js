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
 * Obtener todas las configuraciones (solo metadata)
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
 * Obtener configuración por ID con sus componentes (CON DETALLES COMPLETOS)
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
    const compositions = result.Items.filter(item => item.Type === 'composition');

    // Obtener detalles completos de cada componente
    const componentsWithDetails = [];
    
    for (const comp of compositions) {
      const componentId = comp.SK.replace('COMPONENT#', '');
      
      // Buscar los detalles del componente
      const componentParams = {
        TableName: tableName,
        Key: {
          PK: `COMPONENT#${componentId}`,
          SK: 'METADATA'
        }
      };
      
      const componentResult = await dynamoDB.get(componentParams).promise();
      
      if (componentResult.Item) {
        componentsWithDetails.push({
          quantity: comp.quantity,
          component: componentResult.Item
        });
      }
    }

    res.json({ 
      success: true,
      config: metadata,
      components: componentsWithDetails
    });

  } catch (error) {
    console.error('Error al obtener configuración:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Obtener todas las configuraciones CON conteo de componentes
 * GET /api/catalog/configs
 */
exports.getAllConfigsWithComponentCount = async (req, res) => {
  try {
    // 1. Obtener todas las configs
    const configsParams = {
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

    const configsResult = await dynamoDB.scan(configsParams).promise();
    
    // 2. Para cada config, contar sus componentes
    const configsWithComponentCount = [];
    
    for (const config of configsResult.Items) {
      const configId = config.PK.replace('CONFIG#', '');
      
      // Contar composiciones
      const compositionsParams = {
        TableName: tableName,
        KeyConditionExpression: 'PK = :pk',
        FilterExpression: '#type = :compType',
        ExpressionAttributeNames: {
          '#type': 'Type'
        },
        ExpressionAttributeValues: {
          ':pk': `CONFIG#${configId}`,
          ':compType': 'composition'
        }
      };
      
      const compositionsResult = await dynamoDB.query(compositionsParams).promise();
      
      configsWithComponentCount.push({
        ...config,
        componentCount: compositionsResult.Items.length
      });
    }
        
    res.json({ 
      success: true,
      count: configsWithComponentCount.length,
      configs: configsWithComponentCount
    });

  } catch (error) {
    console.error('Error al obtener configuraciones con componentes:', error);
    res.status(500).json({ error: error.message });
  }
};