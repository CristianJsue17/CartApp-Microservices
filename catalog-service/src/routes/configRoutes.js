const express = require('express');
const router = express.Router();
const configController = require('../controllers/configController');

// Crear configuración
router.post('/', configController.createConfig);

// Obtener todas las configuraciones
router.get('/', configController.getAllConfigs);

// Obtener configuración por ID con componentes
router.get('/:id', configController.getConfigById);

module.exports = router;