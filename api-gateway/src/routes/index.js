const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const services = require('../config/services');

const router = express.Router();

// ============================================
// PROXY PARA CATALOG SERVICE
// ============================================

// Proxy para componentes
router.use('/api/components', createProxyMiddleware({
  target: services.CATALOG_SERVICE,
  changeOrigin: true,
  onProxyReq: (proxyReq, req, res) => {
    console.log(`🔄 Proxy → Catalog Service: ${req.method} ${req.url}`);
  },
  onError: (err, req, res) => {
    console.error('❌ Error en proxy a Catalog Service:', err.message);
    res.status(503).json({
      error: 'Service Unavailable',
      message: 'Catalog Service no disponible',
      service: 'catalog-service'
    });
  }
}));

// Proxy para configuraciones
router.use('/api/configs', createProxyMiddleware({
  target: services.CATALOG_SERVICE,
  changeOrigin: true,
  onProxyReq: (proxyReq, req, res) => {
    console.log(`🔄 Proxy → Catalog Service: ${req.method} ${req.url}`);
  },
  onError: (err, req, res) => {
    console.error('❌ Error en proxy a Catalog Service:', err.message);
    res.status(503).json({
      error: 'Service Unavailable',
      message: 'Catalog Service no disponible',
      service: 'catalog-service'
    });
  }
}));

// ============================================
// PROXY PARA CART SERVICE
// ============================================

router.use('/api/cart', createProxyMiddleware({
  target: services.CART_SERVICE,
  changeOrigin: true,
  onProxyReq: (proxyReq, req, res) => {
    console.log(`🔄 Proxy → Cart Service: ${req.method} ${req.url}`);
  },
  onError: (err, req, res) => {
    console.error('❌ Error en proxy a Cart Service:', err.message);
    res.status(503).json({
      error: 'Service Unavailable',
      message: 'Cart Service no disponible',
      service: 'cart-service'
    });
  }
}));

// ============================================
// PROXY PARA ORDER SERVICE
// ============================================

router.use('/api/orders', createProxyMiddleware({
  target: services.ORDER_SERVICE,
  changeOrigin: true,
  onProxyReq: (proxyReq, req, res) => {
    console.log(`🔄 Proxy → Order Service: ${req.method} ${req.url}`);
  },
  onError: (err, req, res) => {
    console.error('❌ Error en proxy a Order Service:', err.message);
    res.status(503).json({
      error: 'Service Unavailable',
      message: 'Order Service no disponible',
      service: 'order-service'
    });
  }
}));

module.exports = router;