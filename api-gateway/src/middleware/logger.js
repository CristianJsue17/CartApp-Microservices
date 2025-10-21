/**
 * Middleware de logging para todas las peticiones
 */
const logger = (req, res, next) => {
  const start = Date.now();
  
  // Log de la petición entrante
  console.log(`[${new Date().toISOString()}] 📥 ${req.method} ${req.url}`);
  
  // Capturar cuando la respuesta termina
  res.on('finish', () => {
    const duration = Date.now() - start;
    const statusColor = res.statusCode >= 400 ? '🔴' : '🟢';
    console.log(
      `[${new Date().toISOString()}] ${statusColor} ${req.method} ${req.url} - ` +
      `Status: ${res.statusCode} - ${duration}ms`
    );
  });
  
  next();
};

module.exports = logger;