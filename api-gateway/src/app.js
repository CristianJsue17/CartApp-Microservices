require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');

const logger = require('./middleware/logger');
const errorHandler = require('./middleware/errorHandler');
const routes = require('./routes/index');
const services = require('./config/services');

const app = express();
const PORT = process.env.PORT || 4000;

// ============================================
// MIDDLEWARES
// ============================================
app.use(cors());
app.use(express.json());
app.use(logger);

// ============================================
// HEALTH CHECK GLOBAL
// ============================================
app.get('/health', async (req, res) => {
  const healthChecks = {
    gateway: { status: 'OK', timestamp: new Date().toISOString() },
    services: {}
  };

  // Verificar estado de cada microservicio
  const checkService = async (name, url) => {
    try {
      const response = await axios.get(`${url}/health`, { timeout: 3000 });
      healthChecks.services[name] = {
        status: 'OK',
        url: url,
        response: response.data
      };
    } catch (error) {
      healthChecks.services[name] = {
        status: 'UNHEALTHY',
        url: url,
        error: error.message
      };
    }
  };

  await Promise.all([
    checkService('catalog', services.CATALOG_SERVICE),
    checkService('cart', services.CART_SERVICE),
    checkService('order', services.ORDER_SERVICE)
  ]);

  // Determinar estado general
  const allHealthy = Object.values(healthChecks.services).every(s => s.status === 'OK');
  const statusCode = allHealthy ? 200 : 503;

  res.status(statusCode).json(healthChecks);
});

// ============================================
// ROOT ENDPOINT
// ============================================
app.get('/', (req, res) => {
  res.json({
    service: 'API Gateway',
    version: '1.0.0',
    description: 'Gateway centralizado para microservicios de e-commerce',
    endpoints: {
      health: 'GET /health',
      catalog: {
        components: 'GET /api/components',
        configs: 'GET /api/configs',
        configById: 'GET /api/configs/:id'
      },
      cart: {
        add: 'POST /api/cart/add',
        checkAvailability: 'POST /api/cart/check-availability'
      },
      orders: {
        create: 'POST /api/orders',
        getAll: 'GET /api/orders',
        getById: 'GET /api/orders/:orderId',
        getByUser: 'GET /api/orders/user/:userId'
      }
    },
    services: {
      catalog: services.CATALOG_SERVICE,
      cart: services.CART_SERVICE,
      order: services.ORDER_SERVICE
    }
  });
});

// ============================================
// ROUTES (PROXY)
// ============================================
app.use('/', routes);

// ============================================
// 404 HANDLER
// ============================================
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Endpoint ${req.method} ${req.url} no encontrado`,
    availableEndpoints: [
      '/health',
      '/api/components',
      '/api/configs',
      '/api/cart',
      '/api/orders'
    ]
  });
});

// ============================================
// ERROR HANDLER
// ============================================
app.use(errorHandler);

// ============================================
// INICIAR SERVIDOR
// ============================================
app.listen(PORT, () => {
  console.log('=================================');
  console.log('🌐 API GATEWAY INICIADO');
  console.log(`📍 Puerto: ${PORT}`);
  console.log(`🌐 URL: http://localhost:${PORT}`);
  console.log('=================================');
  console.log('🔗 Microservicios configurados:');
  console.log(`   📦 Catalog Service: ${services.CATALOG_SERVICE}`);
  console.log(`   🛒 Cart Service: ${services.CART_SERVICE}`);
  console.log(`   📋 Order Service: ${services.ORDER_SERVICE}`);
  console.log('=================================');
  console.log('✅ Gateway listo para recibir peticiones');
  console.log('=================================\n');
});