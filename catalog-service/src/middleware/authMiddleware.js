const { verifyToken } = require('../utils/jwtUtils');

/**
 * Middleware para verificar JWT en requests
 */
function authenticateToken(req, res, next) {
  // Obtener token del header Authorization
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      error: 'Acceso denegado',
      message: 'No se proporcionó token de autenticación'
    });
  }

  try {
    // Verificar y decodificar token
    const decoded = verifyToken(token);
    
    // Agregar información del usuario al request
    req.user = decoded;
    
    console.log(`✅ Usuario autenticado: ${decoded.email} (${decoded.userId})`);
    next();
  } catch (error) {
    return res.status(403).json({
      error: 'Token inválido',
      message: error.message
    });
  }
}

/**
 * Middleware para verificar rol de administrador
 */
function requireAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({
      error: 'No autenticado',
      message: 'Debe estar autenticado para acceder a este recurso'
    });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({
      error: 'Acceso denegado',
      message: 'Se requieren permisos de administrador'
    });
  }

  next();
}

/**
 * Middleware opcional - no falla si no hay token
 */
function optionalAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    try {
      const decoded = verifyToken(token);
      req.user = decoded;
    } catch (error) {
      // Si el token es inválido, continuar sin usuario
      req.user = null;
    }
  }

  next();
}

module.exports = {
  authenticateToken,
  requireAdmin,
  optionalAuth
};