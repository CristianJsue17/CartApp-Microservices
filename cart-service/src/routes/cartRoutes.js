const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const { authenticateToken } = require('../middleware/authMiddleware');

// Rutas PROTEGIDAS (requieren autenticación)
// Agregar item al carrito - Requiere estar autenticado
router.post('/add', authenticateToken, cartController.addToCart);

// Verificar disponibilidad de componentes - Requiere estar autenticado
router.post('/check-availability', authenticateToken, cartController.checkAvailability);

module.exports = router;