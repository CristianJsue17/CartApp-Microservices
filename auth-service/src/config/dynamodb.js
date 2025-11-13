const AWS = require('aws-sdk');

// Configurar AWS SDK
AWS.config.update({
  region: process.env.AWS_REGION || 'us-east-1'
});

const dynamodb = new AWS.DynamoDB.DocumentClient();
const tableName = process.env.DYNAMODB_TABLE || 'ecommerce-main-v3';

module.exports = {
  dynamodb,
  tableName
};