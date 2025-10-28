// frontend/js/config.js
// ⚠️ IMPORTANTE: Actualizar esta URL cuando despliegues con Terraform

const API_CONFIG = {
  GATEWAY: 'https://gvidbjpx35.execute-api.us-east-1.amazonaws.com/prod/api'  // 🌐 PUNTO ÚNICO DE ENTRADA
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

// ==========================================
// CARRITO DE COMPRAS EN MEMORIA
// ==========================================
let cart = [];

// Agregar item al carrito
function addToCart(configId, configName, configPrice) {
  const existingItem = cart.find(item => item.configId === configId);
  
  if (existingItem) {
    existingItem.quantity += 1;
    showNotification(`Se agregó otra unidad de ${configName} al carrito`, 'success');
  } else {
    cart.push({
      configId,
      configName,
      configPrice,
      quantity: 1
    });
    showNotification(`${configName} agregado al carrito`, 'success');
  }
  
  updateCartBadge();
  saveCartToLocalStorage();
}

// Eliminar item del carrito
function removeFromCart(configId) {
  const index = cart.findIndex(item => item.configId === configId);
  if (index > -1) {
    const itemName = cart[index].configName;
    cart.splice(index, 1);
    showNotification(`${itemName} eliminado del carrito`, 'info');
    updateCartBadge();
    saveCartToLocalStorage();
    loadCart();
  }
}

// Actualizar cantidad en el carrito
function updateCartQuantity(configId, newQuantity) {
  const item = cart.find(item => item.configId === configId);
  if (item) {
    item.quantity = Math.max(1, Math.min(10, newQuantity));
    updateCartBadge();
    saveCartToLocalStorage();
    loadCart();
  }
}

// Vaciar carrito
function clearCart() {
  cart = [];
  updateCartBadge();
  saveCartToLocalStorage();
  showNotification('Carrito vaciado', 'info');
}

// Actualizar badge del carrito
function updateCartBadge() {
  const badge = document.getElementById('cartBadge');
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  
  if (badge) {
    if (totalItems > 0) {
      badge.textContent = totalItems;
      badge.style.display = 'inline-block';
    } else {
      badge.style.display = 'none';
    }
  }
}

// Calcular total del carrito
function getCartTotal() {
  return cart.reduce((sum, item) => sum + (item.configPrice * item.quantity), 0);
}

// Guardar carrito en localStorage
function saveCartToLocalStorage() {
  localStorage.setItem('appCarritoCart', JSON.stringify(cart));
}

// Cargar carrito desde localStorage
function loadCartFromLocalStorage() {
  const saved = localStorage.getItem('appCarritoCart');
  if (saved) {
    cart = JSON.parse(saved);
    updateCartBadge();
  }
}