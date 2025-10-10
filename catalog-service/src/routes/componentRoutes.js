const express = require('express');
const router = express.Router();
const componentController = require('../controllers/componentController');

// Crear componente
router.post('/', componentController.createComponent);

// Obtener todos los componentes
router.get('/', componentController.getAllComponents);

// Obtener componente por ID
router.get('/:id', componentController.getComponentById);

// Actualizar stock de componente
router.patch('/:id/stock', componentController.updateComponentStock);

module.exports = router;