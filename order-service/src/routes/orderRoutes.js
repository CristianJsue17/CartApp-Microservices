const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

// Crear orden (descuenta stock automáticamente)
router.post('/', orderController.createOrder);

// Obtener todas las órdenes
router.get('/', orderController.getAllOrders);

// Obtener orden específica por ID
router.get('/:orderId', orderController.getOrderById);

// Obtener órdenes por usuario
router.get('/user/:userId', orderController.getOrdersByUser);

module.exports = router;