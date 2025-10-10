require('dotenv').config();
const express = require('express');
const cors = require('cors');

const orderRoutes = require('./routes/orderRoutes');

const app = express();
const PORT = process.env.PORT || 3003;

// Middlewares
app.use(cors());
app.use(express.json());

// Logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Routes
app.use('/api/orders', orderRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK',
    service: 'Order Service',
    port: PORT,
    timestamp: new Date().toISOString()
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    service: 'Order Service',
    version: '1.0.0',
    endpoints: {
      createOrder: 'POST /api/orders',
      getAllOrders: 'GET /api/orders',
      getOrderById: 'GET /api/orders/:orderId',
      getOrdersByUser: 'GET /api/orders/user/:userId',
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
  console.log('📦 ORDER SERVICE INICIADO');
  console.log(`📍 Puerto: ${PORT}`);
  console.log(`🌐 URL: http://localhost:${PORT}`);
  console.log(`📊 DynamoDB Table: ${process.env.DYNAMODB_TABLE}`);
  console.log(`🗺️  Región AWS: ${process.env.AWS_REGION}`);
  console.log('=================================');
});