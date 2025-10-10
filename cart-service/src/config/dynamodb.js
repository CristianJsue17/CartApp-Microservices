const AWS = require('aws-sdk');

// Configurar solo la región (usará las credenciales de tu máquina automáticamente)
AWS.config.update({
  region: process.env.AWS_REGION
});

// Crear cliente de DynamoDB
const dynamoDB = new AWS.DynamoDB.DocumentClient();
const tableName = process.env.DYNAMODB_TABLE;

module.exports = { dynamoDB, tableName };