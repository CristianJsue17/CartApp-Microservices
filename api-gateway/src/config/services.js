// Configuración de URLs de los microservicios
module.exports = {
  CATALOG_SERVICE: process.env.CATALOG_SERVICE_URL || 'http://localhost:3001',
  CART_SERVICE: process.env.CART_SERVICE_URL || 'http://localhost:3002',
  ORDER_SERVICE: process.env.ORDER_SERVICE_URL || 'http://localhost:3003'
};