const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authenticateToken, requireAdmin } = require('../middleware/authMiddleware');

// Crear orden (descuenta stock automáticamente) - Usuario autenticado
router.post('/', authenticateToken, orderController.createOrder);

// ⭐ ACTUALIZADO: Obtener todas las órdenes
// - Usuarios normales: ven solo sus órdenes
// - Admins: ven todas las órdenes
// La lógica de permisos está en el controller
router.get('/', authenticateToken, orderController.getAllOrders);

// Obtener órdenes por usuario - Usuario autenticado (solo sus órdenes)
router.get('/user/:userId', authenticateToken, orderController.getOrdersByUser);

// Obtener orden específica por ID - Usuario autenticado (solo sus órdenes)
router.get('/:orderId', authenticateToken, orderController.getOrderById);

module.exports = router;