// frontend/js/auth.js

// ==========================================
// GESTIÓN DE UI DE AUTENTICACIÓN
// ==========================================

// Actualizar UI según estado de autenticación
function updateAuthUI() {
  const user = AUTH.getUser();
  const isAuthenticated = AUTH.isAuthenticated();
  
  // Elementos del navbar
  const userNameElement = document.getElementById('userName');
  const userBadgeElement = document.getElementById('userBadge');
  const userEmailDisplay = document.getElementById('userEmailDisplay');
  
  // Elementos del dropdown
  const guestMenu = document.getElementById('guestMenu');
  const guestMenuRegister = document.getElementById('guestMenuRegister');
  const authMenuProfile = document.getElementById('authMenuProfile');
  const authMenuDivider = document.getElementById('authMenuDivider');
  const authMenuLogout = document.getElementById('authMenuLogout');
  
  if (isAuthenticated && user) {
    // Usuario autenticado
    userNameElement.textContent = user.name || user.email;
    userBadgeElement.textContent = user.role === 'admin' ? 'Admin' : 'Usuario';
    userBadgeElement.className = user.role === 'admin' ? 'auth-badge' : 'auth-badge';
    userEmailDisplay.textContent = user.email;
    
    // Mostrar menú de usuario autenticado
    guestMenu.style.display = 'none';
    guestMenuRegister.style.display = 'none';
    authMenuProfile.style.display = 'block';
    authMenuDivider.style.display = 'block';
    authMenuLogout.style.display = 'block';
    
    // Actualizar CURRENT_USER global
    CURRENT_USER = user;
  } else {
    // Usuario invitado
    userNameElement.textContent = 'Invitado';
    userBadgeElement.textContent = 'Invitado';
    userBadgeElement.className = 'guest-badge';
    
    // Mostrar menú de invitado
    guestMenu.style.display = 'block';
    guestMenuRegister.style.display = 'block';
    authMenuProfile.style.display = 'none';
    authMenuDivider.style.display = 'none';
    authMenuLogout.style.display = 'none';
    
    // Usuario invitado por defecto
    CURRENT_USER = {
      id: 'guest',
      name: 'Invitado',
      email: 'guest@example.com',
      role: 'guest'
    };
  }
}

// ==========================================
// MODALES DE LOGIN Y REGISTRO
// ==========================================

// Mostrar modal de login
function showLoginModal() {
  const loginModal = new bootstrap.Modal(document.getElementById('loginModal'));
  loginModal.show();
}

// Mostrar modal de registro
function showRegisterModal() {
  const registerModal = new bootstrap.Modal(document.getElementById('registerModal'));
  registerModal.show();
}

// Cambiar de login a registro
function switchToRegister() {
  const loginModalElement = document.getElementById('loginModal');
  const loginModal = bootstrap.Modal.getInstance(loginModalElement);
  if (loginModal) loginModal.hide();
  
  setTimeout(() => {
    showRegisterModal();
  }, 300);
}

// Cambiar de registro a login
function switchToLogin() {
  const registerModalElement = document.getElementById('registerModal');
  const registerModal = bootstrap.Modal.getInstance(registerModalElement);
  if (registerModal) registerModal.hide();
  
  setTimeout(() => {
    showLoginModal();
  }, 300);
}

// ==========================================
// HANDLERS DE FORMULARIOS
// ==========================================

// Manejar login
async function handleLogin(event) {
  event.preventDefault();
  
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;
  const loginBtn = document.getElementById('loginBtn');
  
  if (!email || !password) {
    showNotification('Por favor, completa todos los campos', 'warning');
    return;
  }
  
  // Mostrar loading
  const originalText = loginBtn.innerHTML;
  loginBtn.disabled = true;
  loginBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Iniciando sesión...';
  
  try {
    const success = await login(email, password);
    
    if (success) {
      // Cerrar modal
      const loginModalElement = document.getElementById('loginModal');
      const loginModal = bootstrap.Modal.getInstance(loginModalElement);
      if (loginModal) loginModal.hide();
      
      // Limpiar formulario
      document.getElementById('loginForm').reset();
      
      // Actualizar UI
      updateAuthUI();
      
      // Recargar órdenes si estamos en esa sección
      const ordersSection = document.getElementById('ordersSection');
      if (ordersSection && ordersSection.style.display !== 'none') {
        loadOrders();
      }
    }
  } catch (error) {
    console.error('Error en login:', error);
  } finally {
    // Restaurar botón
    loginBtn.disabled = false;
    loginBtn.innerHTML = originalText;
  }
}

// Manejar registro
async function handleRegister(event) {
  event.preventDefault();
  
  const name = document.getElementById('registerName').value.trim();
  const email = document.getElementById('registerEmail').value.trim();
  const password = document.getElementById('registerPassword').value;
  const registerBtn = document.getElementById('registerBtn');
  
  if (!name || !email || !password) {
    showNotification('Por favor, completa todos los campos', 'warning');
    return;
  }
  
  if (password.length < 6) {
    showNotification('La contraseña debe tener al menos 6 caracteres', 'warning');
    return;
  }
  
  // Mostrar loading
  const originalText = registerBtn.innerHTML;
  registerBtn.disabled = true;
  registerBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Registrando...';
  
  try {
    const success = await register(email, password, name);
    
    if (success) {
      // Cerrar modal
      const registerModalElement = document.getElementById('registerModal');
      const registerModal = bootstrap.Modal.getInstance(registerModalElement);
      if (registerModal) registerModal.hide();
      
      // Limpiar formulario
      document.getElementById('registerForm').reset();
      
      // Actualizar UI
      updateAuthUI();
      
      // Mostrar mensaje de bienvenida
      showNotification(`¡Bienvenido ${name}! Tu cuenta ha sido creada exitosamente.`, 'success');
    }
  } catch (error) {
    console.error('Error en registro:', error);
  } finally {
    // Restaurar botón
    registerBtn.disabled = false;
    registerBtn.innerHTML = originalText;
  }
}

// ==========================================
// CERRAR SESIÓN
// ==========================================

function logout() {
  if (confirm('¿Cerrar sesión?')) {
    AUTH.logout();
    updateAuthUI();
    
    // Limpiar carrito
    clearCart();
    
    // Volver al catálogo
    const catalogLink = document.querySelector('[data-section="catalog"]');
    if (catalogLink) catalogLink.click();
    
    showNotification('Sesión cerrada correctamente', 'info');
  }
}

// ==========================================
// FUNCIONES DE VALIDACIÓN
// ==========================================

// Validar email
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Validar contraseña
function isValidPassword(password) {
  return password.length >= 6;
}

// ==========================================
// INICIALIZACIÓN
// ==========================================

// Verificar si el token ha expirado al cargar la página
function checkTokenExpiration() {
  const token = AUTH.getToken();
  if (token) {
    try {
      // Decodificar JWT (sin verificar firma, solo para ver expiración)
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expirationTime = payload.exp * 1000; // Convertir a milisegundos
      const currentTime = Date.now();
      
      if (currentTime >= expirationTime) {
        // Token expirado
        showNotification('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.', 'warning');
        AUTH.logout();
        updateAuthUI();
      }
    } catch (error) {
      console.error('Error al verificar expiración del token:', error);
      // Si hay error al decodificar, cerrar sesión por seguridad
      AUTH.logout();
      updateAuthUI();
    }
  }
}

// Verificar token al cargar la página
document.addEventListener('DOMContentLoaded', function() {
  checkTokenExpiration();
});