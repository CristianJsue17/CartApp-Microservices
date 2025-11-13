const express = require('express');
const router = express.Router();
const componentController = require('../controllers/componentController');
const { authenticateToken, requireAdmin } = require('../middleware/authMiddleware');

// Rutas PÚBLICAS (sin autenticación)
// Obtener todos los componentes
router.get('/', componentController.getAllComponents);

// Obtener componente por ID
router.get('/:id', componentController.getComponentById);


// Rutas PROTEGIDAS (requieren autenticación + rol admin)
// Crear componente - SOLO ADMIN
router.post('/', authenticateToken, requireAdmin, componentController.createComponent);

// Actualizar stock de componente - SOLO ADMIN
router.patch('/:id/stock', authenticateToken, requireAdmin, componentController.updateComponentStock);

module.exports = router;