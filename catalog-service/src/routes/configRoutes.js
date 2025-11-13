const express = require('express');
const router = express.Router();
const configController = require('../controllers/configController');
const { authenticateToken, requireAdmin } = require('../middleware/authMiddleware');

// Rutas PÚBLICAS (sin autenticación)
// Obtener todas las configuraciones CON conteo de componentes
router.get('/catalog/configs', configController.getAllConfigsWithComponentCount);

// Obtener todas las configuraciones (solo metadata)
router.get('/', configController.getAllConfigs);

// Obtener configuración por ID con componentes detallados
router.get('/:id', configController.getConfigById);


// Rutas PROTEGIDAS (requieren autenticación + rol admin)
// Crear configuración - SOLO ADMIN
router.post('/', authenticateToken, requireAdmin, configController.createConfig);

module.exports = router;