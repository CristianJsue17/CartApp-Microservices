const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');

// Agregar item al carrito
router.post('/add', cartController.addToCart);

// Verificar disponibilidad de componentes
router.post('/check-availability', cartController.checkAvailability);

module.exports = router;