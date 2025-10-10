const express = require('express');
const router = express.Router();
const configController = require('../controllers/configController');

// Obtener todas las configuraciones CON conteo de componentes
router.get('/catalog/configs', configController.getAllConfigsWithComponentCount);

// Crear configuración
router.post('/', configController.createConfig);

// Obtener todas las configuraciones (solo metadata)
router.get('/', configController.getAllConfigs);

// Obtener configuración por ID con componentes detallados
router.get('/:id', configController.getConfigById);

module.exports = router;