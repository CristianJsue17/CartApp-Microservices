/**
 * Middleware global de manejo de errores
 */
const errorHandler = (err, req, res, next) => {
  console.error('❌ Error en API Gateway:', err);
  
  // Si el error viene de un proxy
  if (err.code === 'ECONNREFUSED') {
    return res.status(503).json({
      error: 'Service Unavailable',
      message: 'El servicio solicitado no está disponible en este momento',
      details: 'No se pudo conectar con el microservicio'
    });
  }
  
  // Si el error es de timeout
  if (err.code === 'ETIMEDOUT' || err.code === 'ESOCKETTIMEDOUT') {
    return res.status(504).json({
      error: 'Gateway Timeout',
      message: 'El servicio tardó demasiado en responder',
      details: 'Timeout al conectar con el microservicio'
    });
  }
  
  // Error genérico
  res.status(err.status || 500).json({
    error: 'Internal Server Error',
    message: err.message || 'Ocurrió un error en el API Gateway',
    details: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
};

module.exports = errorHandler;