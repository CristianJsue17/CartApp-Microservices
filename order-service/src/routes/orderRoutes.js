const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authenticateToken, requireAdmin } = require('../middleware/authMiddleware');

// Rutas PROTEGIDAS para usuarios autenticados
// Crear orden (descuenta stock automáticamente) - Usuario autenticado
router.post('/', authenticateToken, orderController.createOrder);

// Obtener orden específica por ID - Usuario autenticado (solo sus órdenes)
router.get('/:orderId', authenticateToken, orderController.getOrderById);

// Obtener órdenes por usuario - Usuario autenticado (solo sus órdenes)
router.get('/user/:userId', authenticateToken, orderController.getOrdersByUser);


// Rutas PROTEGIDAS solo para ADMIN
// Obtener todas las órdenes - SOLO ADMIN puede ver todas las órdenes
router.get('/', authenticateToken, requireAdmin, orderController.getAllOrders);

module.exports = router;