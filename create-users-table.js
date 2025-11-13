// create-users-table.js
// Ejecutar: node create-users-table.js
// Este archivo verifica que la tabla DynamoDB existe (ya la tienes creada)
// Solo valida que esté lista para usuarios

const AWS = require('aws-sdk');

AWS.config.update({
  region: 'us-east-1'
});

const dynamodb = new AWS.DynamoDB();
const dynamodbClient = new AWS.DynamoDB.DocumentClient();
const tableName = 'ecommerce-main-v3';

const checkAndPrepareUsersTable = async () => {
  try {
    console.log('🔍 Verificando tabla DynamoDB para usuarios...\n');

    // Verificar que la tabla existe
    const tableInfo = await dynamodb.describeTable({ TableName: tableName }).promise();
    
    console.log('✅ Tabla encontrada:', tableName);
    console.log('📊 Estado:', tableInfo.Table.TableStatus);
    console.log('🔑 Hash Key (PK):', tableInfo.Table.KeySchema.find(k => k.KeyType === 'HASH').AttributeName);
    console.log('🔑 Range Key (SK):', tableInfo.Table.KeySchema.find(k => k.KeyType === 'RANGE').AttributeName);
    console.log('\n✅ La tabla está lista para almacenar usuarios con patrón:');
    console.log('   PK: USER#email@example.com');
    console.log('   SK: USER#email@example.com');
    console.log('\n🎉 No es necesario crear una nueva tabla!');
    console.log('   Los usuarios se guardarán en la misma tabla con el prefijo USER#\n');

  } catch (error) {
    if (error.code === 'ResourceNotFoundException') {
      console.error('❌ Error: La tabla no existe. Debes crearla primero con:');
      console.error('   node create-dynamodb-table.js\n');
      process.exit(1);
    } else {
      console.error('❌ Error al verificar tabla:', error);
      process.exit(1);
    }
  }
};

checkAndPrepareUsersTable();