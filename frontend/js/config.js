// ==========================================
// CONFIGURACIÓN DEL API GATEWAY + JWT
// ==========================================

const API_CONFIG = {
  GATEWAY: 'https://7etakbbf4i.execute-api.us-east-1.amazonaws.com/prod/api',
  API_KEY: 'XuDdKuwDkQ3IkOmpNYqea5kVqwTsSIpW6kWKga0I' // Tu API Key completa
};

// ==========================================
// GESTIÓN DE AUTENTICACIÓN JWT
// ==========================================

const AUTH = {
  // Obtener token del localStorage
  getToken() {
    return localStorage.getItem('jwt_token');
  },
  
  // Guardar token
  setToken(token) {
    localStorage.setItem('jwt_token', token);
  },
  
  // Obtener usuario del localStorage
  getUser() {
    const userStr = localStorage.getItem('user_data');
    return userStr ? JSON.parse(userStr) : null;
  },
  
  // Guardar usuario
  setUser(user) {
    localStorage.setItem('user_data', JSON.stringify(user));
  },
  
  // Verificar si está autenticado
  isAuthenticated() {
    return !!this.getToken();
  },
  
  // Cerrar sesión
  logout() {
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('user_data');
    location.reload();
  }
};

// ==========================================
// CONFIGURAR AXIOS CON API KEY + JWT
// ==========================================

(function setupAxios() {
  if (typeof axios !== 'undefined') {
    // Headers por defecto
    axios.defaults.headers.common['x-api-key'] = API_CONFIG.API_KEY;
    axios.defaults.headers.common['Content-Type'] = 'application/json';
    
    // Interceptor para agregar JWT token automáticamente
    axios.interceptors.request.use(
      config => {
        const token = AUTH.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      error => Promise.reject(error)
    );
    
    // Interceptor para manejar errores
    axios.interceptors.response.use(
      response => response,
      error => {
        if (error.response?.status === 401) {
          console.error('❌ No autenticado o token expirado');
          showNotification('Sesión expirada. Por favor, inicia sesión nuevamente.', 'warning');
          AUTH.logout();
        } else if (error.response?.status === 403) {
          console.error('❌ No autorizado');
          showNotification('No tienes permisos para esta acción', 'danger');
        } else if (error.response?.status === 429) {
          console.error('⚠️ Rate limit excedido');
          showNotification('Demasiadas solicitudes - Intenta más tarde', 'warning');
        }
        return Promise.reject(error);
      }
    );
    
    console.log('✅ Axios configurado con API Key + JWT interceptors');
  } else {
    setTimeout(setupAxios, 100);
  }
})();

// ==========================================
// USUARIO ACTUAL (CON JWT)
// ==========================================

let CURRENT_USER = AUTH.getUser() || {
  id: 'guest',
  name: 'Invitado',
  email: 'guest@example.com',
  role: 'guest'
};

// ==========================================
// FUNCIONES DE AUTENTICACIÓN
// ==========================================

async function login(email, password) {
  try {
    const response = await axios.post(`${API_CONFIG.GATEWAY}/auth/login`, {
      email,
      password
    });
    
    const { token, user } = response.data;
    
    // Guardar token y usuario
    AUTH.setToken(token);
    AUTH.setUser(user);
    CURRENT_USER = user;
    
    showNotification(`Bienvenido ${user.name}!`, 'success');
    return true;
  } catch (error) {
    handleError(error, 'Login');
    return false;
  }
}

async function register(email, password, name) {
  try {
    const response = await axios.post(`${API_CONFIG.GATEWAY}/auth/register`, {
      email,
      password,
      name
    });
    
    const { token, user } = response.data;
    
    // Guardar token y usuario
    AUTH.setToken(token);
    AUTH.setUser(user);
    CURRENT_USER = user;
    
    showNotification(`Registro exitoso! Bienvenido ${user.name}!`, 'success');
    return true;
  } catch (error) {
    handleError(error, 'Registro');
    return false;
  }
}

function logout() {
  if (confirm('¿Cerrar sesión?')) {
    AUTH.logout();
  }
}

// ==========================================
// FUNCIÓN HELPER PARA PETICIONES SEGURAS
// ==========================================

async function secureFetch(url, options = {}) {
  const defaultHeaders = {
    'x-api-key': API_CONFIG.API_KEY,
    'Content-Type': 'application/json'
  };
  
  // Agregar JWT si existe
  const token = AUTH.getToken();
  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers
    }
  };

  try {
    const response = await fetch(url, config);
    
    if (response.status === 401) {
      showNotification('Sesión expirada. Por favor, inicia sesión.', 'warning');
      AUTH.logout();
      throw new Error('No autenticado');
    }
    
    if (response.status === 403) {
      throw new Error('No autorizado - Verifica tu API Key o permisos');
    }
    
    if (response.status === 429) {
      throw new Error('Demasiadas solicitudes - Intenta más tarde');
    }
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    
    return response;
  } catch (error) {
    console.error('Error en petición:', error);
    throw error;
  }
}

// ==========================================
// HELPER FUNCTIONS
// ==========================================

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
  
  setTimeout(() => alertDiv.remove(), 5000);
}

function formatPrice(price) {
  return `$${parseFloat(price).toFixed(2)}`;
}

function handleError(error, context = '') {
  console.error(`Error en ${context}:`, error);
  let message = 'Ocurrió un error. Por favor, intenta de nuevo.';
  
  if (error.response?.data?.message) {
    message = error.response.data.message;
  } else if (error.response?.data?.error) {
    message = error.response.data.error;
  } else if (error.message) {
    message = error.message;
  }
  
  showNotification(message, 'danger');
}

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

function getStockBadge(stock) {
  if (stock > 10) return '<span class="badge bg-success">Disponible</span>';
  if (stock > 5) return '<span class="badge bg-warning text-dark">Poco Stock</span>';
  if (stock > 0) return '<span class="badge bg-danger">Últimas Unidades</span>';
  return '<span class="badge bg-secondary">Sin Stock</span>';
}

function formatSpecs(specs) {
  if (!specs) return '';
  return Object.entries(specs)
    .map(([key, value]) => `<span class="badge bg-light text-dark me-1 mb-1">${key}: ${value}</span>`)
    .join('');
}

// ==========================================
// CARRITO DE COMPRAS (SIN CAMBIOS)
// ==========================================

let cart = [];

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

function updateCartQuantity(configId, newQuantity) {
  const item = cart.find(item => item.configId === configId);
  if (item) {
    item.quantity = Math.max(1, Math.min(10, newQuantity));
    updateCartBadge();
    saveCartToLocalStorage();
    loadCart();
  }
}

function clearCart() {
  cart = [];
  updateCartBadge();
  saveCartToLocalStorage();
  showNotification('Carrito vaciado', 'info');
}

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

function getCartTotal() {
  return cart.reduce((sum, item) => sum + (item.configPrice * item.quantity), 0);
}

function saveCartToLocalStorage() {
  localStorage.setItem('appCarritoCart', JSON.stringify(cart));
}

function loadCartFromLocalStorage() {
  const saved = localStorage.getItem('appCarritoCart');
  if (saved) {
    cart = JSON.parse(saved);
    updateCartBadge();
  }
}