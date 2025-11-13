// frontend/js/cart-view.js

// Mostrar modal del carrito
function showCart() {
  try {
    const modalElement = document.getElementById('cartModal');
    if (!modalElement) {
      console.error('Modal cartModal no encontrado');
      return;
    }
    
    loadCart();
    const modal = new bootstrap.Modal(modalElement);
    modal.show();
  } catch (error) {
    console.error('Error al abrir carrito:', error);
    alert('Error al abrir el carrito. Verifica la consola.');
  }
}

// Cargar y renderizar el carrito
function loadCart() {
  const container = document.getElementById('cartItemsContainer');
  const totalElement = document.getElementById('cartTotal');
  const checkoutBtn = document.getElementById('checkoutBtn');
  
  if (!container || !totalElement || !checkoutBtn) {
    console.error('Elementos del carrito no encontrados');
    return;
  }
  
  if (cart.length === 0) {
    container.innerHTML = `
      <div class="text-center py-5">
        <i class="bi bi-cart-x" style="font-size: 4rem; color: #ccc;"></i>
        <p class="text-muted mt-3">Tu carrito está vacío</p>
        <button class="btn btn-primary" data-bs-dismiss="modal">
          <i class="bi bi-shop"></i> Seguir Comprando
        </button>
      </div>
    `;
    totalElement.textContent = formatPrice(0);
    checkoutBtn.disabled = true;
    return;
  }
  
  checkoutBtn.disabled = false;
  
  let html = '';
  cart.forEach(item => {
    const subtotal = item.configPrice * item.quantity;
    html += `
      <div class="cart-item border-bottom py-3">
        <div class="row align-items-center">
          <div class="col-md-5">
            <h6 class="mb-1"><i class="bi bi-laptop"></i> ${item.configName}</h6>
            <small class="text-muted">${formatPrice(item.configPrice)} c/u</small>
          </div>
          <div class="col-md-3">
            <div class="input-group input-group-sm">
              <button class="btn btn-outline-secondary" onclick="updateCartQuantity('${item.configId}', ${item.quantity - 1})">
                <i class="bi bi-dash"></i>
              </button>
              <input type="number" class="form-control text-center" value="${item.quantity}" 
                     onchange="updateCartQuantity('${item.configId}', parseInt(this.value))" 
                     min="1" max="10" style="max-width: 60px;">
              <button class="btn btn-outline-secondary" onclick="updateCartQuantity('${item.configId}', ${item.quantity + 1})">
                <i class="bi bi-plus"></i>
              </button>
            </div>
          </div>
          <div class="col-md-3 text-end">
            <strong class="text-primary">${formatPrice(subtotal)}</strong>
          </div>
          <div class="col-md-1 text-end">
            <button class="btn btn-sm btn-outline-danger" onclick="removeFromCart('${item.configId}')" title="Eliminar">
              <i class="bi bi-trash"></i>
            </button>
          </div>
        </div>
      </div>
    `;
  });
  
  container.innerHTML = html;
  totalElement.textContent = formatPrice(getCartTotal());
}

// Proceder al checkout (crear todas las órdenes con JWT)
async function checkout() {
  if (cart.length === 0) {
    showNotification('El carrito está vacío', 'warning');
    return;
  }
  
  // Verificar autenticación
  if (!AUTH.isAuthenticated()) {
    showNotification('Debes iniciar sesión para completar la compra', 'warning');
    const cartModalElement = document.getElementById('cartModal');
    const cartModal = bootstrap.Modal.getInstance(cartModalElement);
    if (cartModal) cartModal.hide();
    showLoginModal();
    return;
  }
  
  const confirmed = confirm(
    `¿Confirmar compra del carrito?\n\n` +
    `Total de items: ${cart.reduce((sum, item) => sum + item.quantity, 0)}\n` +
    `Total a pagar: ${formatPrice(getCartTotal())}`
  );
  
  if (!confirmed) return;
  
  const checkoutBtn = document.getElementById('checkoutBtn');
  const originalText = checkoutBtn.innerHTML;
  checkoutBtn.disabled = true;
  checkoutBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Procesando...';
  
  try {
    let successCount = 0;
    let failedItems = [];
    
    // Crear una orden por cada item del carrito
    // ⭐ NOTA: Ya NO se envía userId, se obtiene del JWT automáticamente
    for (const item of cart) {
      try {
        await axios.post(`${API_CONFIG.GATEWAY}/orders`, {
          configId: item.configId,
          quantity: item.quantity
        });
        successCount++;
      } catch (error) {
        console.error(`Error al procesar ${item.configName}:`, error);
        failedItems.push({
          name: item.configName,
          error: error.response?.data?.message || 'Error desconocido'
        });
      }
    }
    
    // Cerrar modal del carrito
    const cartModalElement = document.getElementById('cartModal');
    const cartModal = bootstrap.Modal.getInstance(cartModalElement);
    if (cartModal) cartModal.hide();
    
    // Mostrar resultados
    if (successCount === cart.length) {
      showNotification(`✅ ¡Compra exitosa! ${successCount} producto(s) ordenado(s)`, 'success');
      clearCart();
      
      // Recargar catálogo
      setTimeout(() => {
        loadConfigs();
        loadComponents();
      }, 2000);
      
      // Mostrar órdenes
      setTimeout(() => {
        const ordersLink = document.querySelector('[data-section="orders"]');
        if (ordersLink) ordersLink.click();
      }, 500);
    } else if (successCount > 0) {
      showNotification(
        `⚠️ Compra parcial: ${successCount} exitoso(s), ${failedItems.length} fallido(s)`,
        'warning'
      );
      
      // Eliminar items exitosos del carrito
      cart = cart.filter(item => 
        failedItems.some(failed => failed.name === item.configName)
      );
      saveCartToLocalStorage();
      loadCart();
    } else {
      showNotification('❌ Error al procesar la compra. Intenta de nuevo.', 'danger');
    }
    
  } catch (error) {
    if (error.response?.status === 401) {
      showNotification('Sesión expirada. Inicia sesión nuevamente.', 'warning');
      showLoginModal();
    } else {
      handleError(error, 'checkout');
    }
  } finally {
    checkoutBtn.disabled = false;
    checkoutBtn.innerHTML = originalText;
  }
}