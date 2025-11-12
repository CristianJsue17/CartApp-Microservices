require('dotenv').config();
const express = require('express');
const cors = require('cors');

const cartRoutes = require('./routes/cartRoutes');

const app = express();
const PORT = process.env.PORT || 3002;

// ⭐ CORS Configuration mejorada para API Gateway
const corsOptions = {
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Api-Key',
    'x-api-key',   // permitir API-KEY
    'X-Amz-Date',
    'X-Amz-Security-Token'
  ],
  exposedHeaders: ['Content-Length', 'X-Request-Id'],
  credentials: true,
  maxAge: 86400
};

// Middlewares
app.use(cors(corsOptions)); // ⭐ Usar configuración explícita
app.use(express.json());

// Logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Routes
app.use('/api/cart', cartRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK',
    service: 'Cart Service',
    port: PORT,
    timestamp: new Date().toISOString(),
    catalogServiceUrl: process.env.CATALOG_SERVICE_URL
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    service: 'Cart Service',
    version: '1.0.0',
    endpoints: {
      addToCart: 'POST /api/cart/add',
      checkAvailability: 'POST /api/cart/check-availability',
      health: '/health'
    }
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: 'Internal Server Error',
    message: err.message 
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Endpoint no encontrado',
    path: req.url 
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log('=================================');
  console.log('🛒 CART SERVICE INICIADO');
  console.log(`📍 Puerto: ${PORT}`);
  console.log(`🌐 URL: http://localhost:${PORT}`);
  console.log(`📊 DynamoDB Table: ${process.env.DYNAMODB_TABLE}`);
  console.log(`🗺️  Región AWS: ${process.env.AWS_REGION}`);
  console.log(`🔗 Catalog Service: ${process.env.CATALOG_SERVICE_URL}`);
  console.log('✅ CORS configurado para API Gateway');
  console.log('=================================');
});