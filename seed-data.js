// seed-data.js
// Ejecutar: node seed-data.js
// Coloca este archivo en la raíz del proyecto (fuera de los microservicios)

const AWS = require('aws-sdk');

AWS.config.update({
  region: 'us-east-1'
});

const dynamoDB = new AWS.DynamoDB.DocumentClient();
const tableName = 'ecommerce-main-v3';

const seedData = async () => {
  try {
    console.log('🌱 Iniciando carga de datos de prueba...\n');

    // ========================================
    // 1. CREAR COMPONENTES
    // ========================================
    console.log('📦 Creando componentes...');
    
    const components = [
      {
        PK: 'COMPONENT#RAM-8GB',
        SK: 'METADATA',
        Type: 'component',
        name: 'RAM 8GB DDR4',
        stock: 50,
        price: 45.00,
        specs: { type: 'DDR4', capacity: '8GB', speed: '3200MHz' }
      },
      {
        PK: 'COMPONENT#RAM-16GB',
        SK: 'METADATA',
        Type: 'component',
        name: 'RAM 16GB DDR4',
        stock: 40,
        price: 75.00,
        specs: { type: 'DDR4', capacity: '16GB', speed: '3600MHz' }
      },
      {
        PK: 'COMPONENT#SSD-512GB',
        SK: 'METADATA',
        Type: 'component',
        name: 'SSD 512GB NVMe',
        stock: 30,
        price: 60.00,
        specs: { type: 'NVMe', capacity: '512GB', speed: '3500MB/s' }
      },
      {
        PK: 'COMPONENT#SSD-1TB',
        SK: 'METADATA',
        Type: 'component',
        name: 'SSD 1TB NVMe',
        stock: 25,
        price: 110.00,
        specs: { type: 'NVMe', capacity: '1TB', speed: '7000MB/s' }
      },
      {
        PK: 'COMPONENT#CPU-I7',
        SK: 'METADATA',
        Type: 'component',
        name: 'Intel Core i7 12th Gen',
        stock: 20,
        price: 320.00,
        specs: { cores: 12, threads: 20, frequency: '4.9GHz' }
      },
      {
        PK: 'COMPONENT#CPU-I9',
        SK: 'METADATA',
        Type: 'component',
        name: 'Intel Core i9 13th Gen',
        stock: 15,
        price: 480.00,
        specs: { cores: 24, threads: 32, frequency: '5.8GHz' }
      },
      {
        PK: 'COMPONENT#GPU-RTX3060',
        SK: 'METADATA',
        Type: 'component',
        name: 'NVIDIA RTX 3060',
        stock: 18,
        price: 350.00,
        specs: { vram: '12GB', tdp: '170W' }
      },
      {
        PK: 'COMPONENT#GPU-RTX4070',
        SK: 'METADATA',
        Type: 'component',
        name: 'NVIDIA RTX 4070',
        stock: 12,
        price: 600.00,
        specs: { vram: '12GB', tdp: '200W' }
      },
      {
        PK: 'COMPONENT#MOBO-Z690',
        SK: 'METADATA',
        Type: 'component',
        name: 'Motherboard Z690',
        stock: 25,
        price: 180.00,
        specs: { chipset: 'Z690', socket: 'LGA1700' }
      },
      {
        PK: 'COMPONENT#PSU-750W',
        SK: 'METADATA',
        Type: 'component',
        name: 'Power Supply 750W 80+ Gold',
        stock: 30,
        price: 95.00,
        specs: { wattage: '750W', efficiency: '80+ Gold' }
      }
    ];

    for (const component of components) {
      await dynamoDB.put({ TableName: tableName, Item: component }).promise();
      console.log(`   ✅ ${component.name} (Stock: ${component.stock})`);
    }

    console.log(`\n📊 ${components.length} componentes creados\n`);

    // ========================================
    // 2. CREAR CONFIGURACIONES
    // ========================================
    console.log('🖥️  Creando configuraciones de computadoras...');
    
    const configs = [
      {
        PK: 'CONFIG#LAPTOP-GAMING-01',
        SK: 'METADATA',
        Type: 'config',
        name: 'Gaming Laptop Pro',
        price: 1299.00,
        description: 'Laptop para gaming de alto rendimiento con RTX 3060'
      },
      {
        PK: 'CONFIG#LAPTOP-GAMING-02',
        SK: 'METADATA',
        Type: 'config',
        name: 'Gaming Laptop Ultra',
        price: 1899.00,
        description: 'Laptop gaming premium con RTX 4070 y i9'
      },
      {
        PK: 'CONFIG#WORKSTATION-01',
        SK: 'METADATA',
        Type: 'config',
        name: 'Workstation Professional',
        price: 1599.00,
        description: 'Estación de trabajo para profesionales creativos'
      },
      {
        PK: 'CONFIG#PC-OFFICE-01',
        SK: 'METADATA',
        Type: 'config',
        name: 'PC Oficina Básico',
        price: 799.00,
        description: 'Computadora de escritorio para tareas de oficina'
      }
    ];

    for (const config of configs) {
      await dynamoDB.put({ TableName: tableName, Item: config }).promise();
      console.log(`   ✅ ${config.name} ($${config.price})`);
    }

    console.log(`\n🖥️  ${configs.length} configuraciones creadas\n`);

    // ========================================
    // 3. CREAR COMPOSICIONES
    // ========================================
    console.log('🔧 Creando composiciones (componentes de cada configuración)...');
    
    const compositions = [
      // Gaming Laptop Pro (LAPTOP-GAMING-01)
      { PK: 'CONFIG#LAPTOP-GAMING-01', SK: 'COMPONENT#RAM-8GB', Type: 'composition', quantity: 2 },
      { PK: 'CONFIG#LAPTOP-GAMING-01', SK: 'COMPONENT#SSD-512GB', Type: 'composition', quantity: 1 },
      { PK: 'CONFIG#LAPTOP-GAMING-01', SK: 'COMPONENT#CPU-I7', Type: 'composition', quantity: 1 },
      { PK: 'CONFIG#LAPTOP-GAMING-01', SK: 'COMPONENT#GPU-RTX3060', Type: 'composition', quantity: 1 },
      
      // Gaming Laptop Ultra (LAPTOP-GAMING-02)
      { PK: 'CONFIG#LAPTOP-GAMING-02', SK: 'COMPONENT#RAM-16GB', Type: 'composition', quantity: 2 },
      { PK: 'CONFIG#LAPTOP-GAMING-02', SK: 'COMPONENT#SSD-1TB', Type: 'composition', quantity: 1 },
      { PK: 'CONFIG#LAPTOP-GAMING-02', SK: 'COMPONENT#CPU-I9', Type: 'composition', quantity: 1 },
      { PK: 'CONFIG#LAPTOP-GAMING-02', SK: 'COMPONENT#GPU-RTX4070', Type: 'composition', quantity: 1 },
      
      // Workstation Professional (WORKSTATION-01)
      { PK: 'CONFIG#WORKSTATION-01', SK: 'COMPONENT#RAM-16GB', Type: 'composition', quantity: 4 },
      { PK: 'CONFIG#WORKSTATION-01', SK: 'COMPONENT#SSD-1TB', Type: 'composition', quantity: 2 },
      { PK: 'CONFIG#WORKSTATION-01', SK: 'COMPONENT#CPU-I7', Type: 'composition', quantity: 1 },
      { PK: 'CONFIG#WORKSTATION-01', SK: 'COMPONENT#MOBO-Z690', Type: 'composition', quantity: 1 },
      { PK: 'CONFIG#WORKSTATION-01', SK: 'COMPONENT#PSU-750W', Type: 'composition', quantity: 1 },
      
      // PC Oficina (PC-OFFICE-01)
      { PK: 'CONFIG#PC-OFFICE-01', SK: 'COMPONENT#RAM-8GB', Type: 'composition', quantity: 2 },
      { PK: 'CONFIG#PC-OFFICE-01', SK: 'COMPONENT#SSD-512GB', Type: 'composition', quantity: 1 },
      { PK: 'CONFIG#PC-OFFICE-01', SK: 'COMPONENT#CPU-I7', Type: 'composition', quantity: 1 },
      { PK: 'CONFIG#PC-OFFICE-01', SK: 'COMPONENT#MOBO-Z690', Type: 'composition', quantity: 1 },
      { PK: 'CONFIG#PC-OFFICE-01', SK: 'COMPONENT#PSU-750W', Type: 'composition', quantity: 1 }
    ];

    for (const composition of compositions) {
      await dynamoDB.put({ TableName: tableName, Item: composition }).promise();
      const configName = composition.PK.replace('CONFIG#', '');
      const componentName = composition.SK.replace('COMPONENT#', '');
      console.log(`   ✅ ${configName} → ${componentName} (x${composition.quantity})`);
    }

    console.log(`\n🔧 ${compositions.length} composiciones creadas\n`);

    // ========================================
    // RESUMEN FINAL
    // ========================================
    console.log('═══════════════════════════════════════════════');
    console.log('🎉 DATOS CARGADOS EXITOSAMENTE!');
    console.log('═══════════════════════════════════════════════');
    console.log(`📦 Componentes: ${components.length}`);
    console.log(`🖥️  Configuraciones: ${configs.length}`);
    console.log(`🔧 Composiciones: ${compositions.length}`);
    console.log('═══════════════════════════════════════════════\n');
    console.log('✅ Ahora puedes iniciar los microservicios:');
    console.log('   1. cd catalog-service && npm install && npm start');
    console.log('   2. cd cart-service && npm install && npm start');
    console.log('   3. cd order-service && npm install && npm start\n');

  } catch (error) {
    console.error('❌ Error al cargar datos:', error);
    process.exit(1);
  }
};

seedData();