// frontend/js/config.js
// ⚠️ IMPORTANTE: Actualiza estas URLs cada vez que levantes la infraestructura con Terraform
// Las IPs cambian cada vez que haces terraform apply

const API_CONFIG = {
  CATALOG_SERVICE: 'http://54.242.254.4:3001',  // ⬅️ CAMBIAR ESTA IP
  CART_SERVICE: 'http://54.242.254.4:3002',     // ⬅️ CAMBIAR ESTA IP
  ORDER_SERVICE: 'http://54.242.254.4:3003'     // ⬅️ CAMBIAR ESTA IP
};

// Usuario actual (simulado - en producción vendría de autenticación)
const CURRENT_USER = {
  id: 'user123',
  name: 'Usuario Demo'
};

// Helper para mostrar notificaciones
function showNotification(message, type = 'success') {
  const alertDiv = document.createElement('div');
  alertDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed top-0 start-50 translate-middle-x mt-3`;
  alertDiv.style.zIndex = '9999';
  alertDiv.style.minWidth = '300px';
  alertDiv.innerHTML = `
    <strong>${type === 'success' ? '✅' : type === 'danger' ? '❌' : '⚠️'}</strong> ${message}
    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
  `;
  document.body.appendChild(alertDiv);
  
  setTimeout(() => {
    alertDiv.remove();
  }, 5000);
}

// Helper para formatear precios
function formatPrice(price) {
  return `$${parseFloat(price).toFixed(2)}`;
}

// Helper para manejar errores de API
function handleError(error, context = '') {
  console.error(`Error en ${context}:`, error);
  let message = 'Ocurrió un error. Por favor, intenta de nuevo.';
  
  if (error.response) {
    message = error.response.data?.error || error.response.data?.message || message;
  } else if (error.message) {
    message = error.message;
  }
  
  showNotification(message, 'danger');
}

// Helper para mostrar loading
function showLoading(elementId) {
  const element = document.getElementById(elementId);
  if (element) {
    element.innerHTML = `
      <div class="text-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Cargando...</span>
        </div>
        <p class="mt-2 text-muted">Cargando datos...</p>
      </div>
    `;
  }
}

// Helper para obtener badge de stock
function getStockBadge(stock) {
  if (stock > 10) return '<span class="badge bg-success">Disponible</span>';
  if (stock > 5) return '<span class="badge bg-warning text-dark">Poco Stock</span>';
  if (stock > 0) return '<span class="badge bg-danger">Últimas Unidades</span>';
  return '<span class="badge bg-secondary">Sin Stock</span>';
}

// Helper para formatear specs de componentes
function formatSpecs(specs) {
  if (!specs) return '';
  return Object.entries(specs)
    .map(([key, value]) => `<span class="badge bg-light text-dark me-1 mb-1">${key}: ${value}</span>`)
    .join('');
}