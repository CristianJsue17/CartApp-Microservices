require('dotenv').config();
const express = require('express');
const cors = require('cors');

const componentRoutes = require('./routes/componentRoutes');
const configRoutes = require('./routes/configRoutes');

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors());
app.use(express.json());

// Logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Routes
app.use('/api/components', componentRoutes);
app.use('/api/configs', configRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK',
    service: 'Catalog Service',
    port: PORT,
    timestamp: new Date().toISOString()
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    service: 'Catalog Service',
    version: '1.0.0',
    endpoints: {
      components: '/api/components',
      configs: '/api/configs',
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
  console.log('🚀 CATALOG SERVICE INICIADO');
  console.log(`📍 Puerto: ${PORT}`);
  console.log(`🌐 URL: http://localhost:${PORT}`);
  console.log(`📊 DynamoDB Table: ${process.env.DYNAMODB_TABLE}`);
  console.log(`🗺️  Región AWS: ${process.env.AWS_REGION}`);
  console.log('=================================');
});