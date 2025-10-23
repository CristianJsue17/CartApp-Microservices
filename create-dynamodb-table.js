// create-dynamodb-table.js
// Ejecutar: node create-dynamodb-table.js
// Coloca este archivo en la raíz del proyecto (fuera de los microservicios)

const AWS = require('aws-sdk');

// Configurar AWS (usará tus credenciales locales)
AWS.config.update({
  region: 'us-east-1'
});

const dynamodb = new AWS.DynamoDB();

const params = {
  TableName: 'ecommerce-main-v3',
  KeySchema: [
    { AttributeName: 'PK', KeyType: 'HASH' },  // Partition key
    { AttributeName: 'SK', KeyType: 'RANGE' }  // Sort key
  ],
  AttributeDefinitions: [
    { AttributeName: 'PK', AttributeType: 'S' },
    { AttributeName: 'SK', AttributeType: 'S' }
  ],
  BillingMode: 'PAY_PER_REQUEST' // Modo on-demand (gratis hasta 25 GB y 200M requests/mes)
};

console.log('🚀 Creando tabla DynamoDB...');
console.log('📋 Nombre: ecommerce-main-v3');
console.log('🗺️  Región: us-east-1');
console.log('💰 Billing: PAY_PER_REQUEST (Free Tier)');
console.log('');

dynamodb.createTable(params, (err, data) => {
  if (err) {
    if (err.code === 'ResourceInUseException') {
      console.log('⚠️  La tabla ya existe!');
    } else {
      console.error('❌ Error al crear tabla:', JSON.stringify(err, null, 2));
    }
  } else {
    console.log('✅ Tabla creada exitosamente!');
    console.log('');
    console.log('📊 Detalles:');
    console.log(`   - ARN: ${data.TableDescription.TableArn}`);
    console.log(`   - Estado: ${data.TableDescription.TableStatus}`);
    console.log('');
    console.log('⏳ Esperando que la tabla esté activa (puede tardar 10-30 segundos)...');
    console.log('💡 Ejecuta: node seed-data.js para cargar datos de prueba');
  }
});