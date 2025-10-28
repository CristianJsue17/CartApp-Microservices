// frontend/js/orders.js

// Crear una nueva orden desde el modal
async function createOrderFromModal(configId, configName) {
  const quantity = parseInt(document.getElementById('orderQuantity').value);
  
  if (quantity < 1) {
    showNotification('La cantidad debe ser mayor a 0', 'warning');
    return;
  }
  
  const confirmed = confirm(
    `¿Confirmar compra?\n\n` +
    `Computadora: ${configName}\n` +
    `Cantidad: ${quantity} unidad(es)\n\n` +
    `Se descontará el stock de los componentes necesarios.`
  );
  
  if (!confirmed) return;
  
  await createOrder(configId, quantity);
}

// Crear una nueva orden
async function createOrder(configId, quantity) {
  try {
    // Mostrar indicador de carga
    const orderBtn = document.getElementById('createOrderBtn');
    const originalText = orderBtn.innerHTML;
    orderBtn.disabled = true;
    orderBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Procesando...';
    
    const response = await axios.post(`${API_CONFIG.GATEWAY}/orders`, {
      userId: CURRENT_USER.id,
      configId: configId,
      quantity: quantity
    });
    
    // Restaurar botón
    orderBtn.disabled = false;
    orderBtn.innerHTML = originalText;
    
    if (response.data.success) {
      showNotification(response.data.message, 'success');
      
      // Cerrar modales
      const configModal = bootstrap.Modal.getInstance(document.getElementById('configModal'));
      if (configModal) configModal.hide();
      
      const availModal = bootstrap.Modal.getInstance(document.getElementById('availabilityModal'));
      if (availModal) availModal.hide();
      
      // Mostrar detalles de la orden
      showOrderSuccessModal(response.data.order);
      
      // Recargar catálogo para ver stock actualizado
      setTimeout(() => {
        loadConfigs();
        loadComponents();
      }, 2000);
    }
    
  } catch (error) {
    // Restaurar botón en caso de error
    const orderBtn = document.getElementById('createOrderBtn');
    if (orderBtn) {
      orderBtn.disabled = false;
      orderBtn.innerHTML = '<i class="bi bi-cart-check"></i> Crear Orden';
    }
    
    // Manejar errores específicos de stock insuficiente
    if (error.response && error.response.data) {
      const errorData = error.response.data;
      if (errorData.error === 'Stock insuficiente') {
        showNotification(
          `❌ ${errorData.message}`,
          'danger'
        );
      } else {
        handleError(error, 'createOrder');
      }
    } else {
      handleError(error, 'createOrder');
    }
  }
}

// Mostrar modal de orden exitosa
function showOrderSuccessModal(order) {
  const modal = new bootstrap.Modal(document.getElementById('orderSuccessModal'));
  const modalBody = document.getElementById('orderSuccessModalBody');
  
  let componentsHTML = '';
  if (order.componentsUsed && order.componentsUsed.length > 0) {
    componentsHTML = `
      <div class="mt-3">
        <h6><i class="bi bi-box-seam"></i> Componentes Descontados:</h6>
        <div class="table-responsive">
          <table class="table table-sm">
            <thead class="table-light">
              <tr>
                <th>Componente</th>
                <th class="text-center">Cantidad Usada</th>
                <th class="text-center">Stock Restante</th>
              </tr>
            </thead>
            <tbody>
              ${order.componentsUsed.map(comp => `
                <tr>
                  <td>${comp.componentName}</td>
                  <td class="text-center">
                    <span class="badge bg-primary">${comp.quantityUsed}</span>
                  </td>
                  <td class="text-center">
                    <span class="badge bg-success">${comp.stockAfter}</span>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }
  
  modalBody.innerHTML = `
    <div class="text-center mb-4">
      <i class="bi bi-check-circle-fill text-success" style="font-size: 4rem;"></i>
      <h4 class="mt-3">¡Orden Creada Exitosamente!</h4>
    </div>
    
    <div class="card">
      <div class="card-body">
        <h6 class="card-subtitle mb-3 text-muted">Detalles de la Orden</h6>
        
        <div class="row">
          <div class="col-6">
            <small class="text-muted">ID de Orden:</small>
            <p class="mb-2"><strong>${order.orderId.substring(0, 8)}...</strong></p>
          </div>
          <div class="col-6">
            <small class="text-muted">Estado:</small>
            <p class="mb-2">
              <span class="badge bg-success">${order.status}</span>
            </p>
          </div>
        </div>
        
        <hr>
        
        <div class="row">
          <div class="col-12">
            <small class="text-muted">Computadora:</small>
            <p class="mb-2"><strong><i class="bi bi-laptop"></i> ${order.configName}</strong></p>
          </div>
        </div>
        
        <div class="row">
          <div class="col-6">
            <small class="text-muted">Cantidad:</small>
            <p class="mb-2"><strong>${order.quantity}</strong></p>
          </div>
          <div class="col-6">
            <small class="text-muted">Total:</small>
            <p class="mb-2"><strong class="text-primary fs-5">${formatPrice(order.totalPrice)}</strong></p>
          </div>
        </div>
        
        ${componentsHTML}
        
        <div class="mt-3">
          <small class="text-muted">
            <i class="bi bi-clock"></i> ${new Date(order.createdAt).toLocaleString('es-ES')}
          </small>
        </div>
      </div>
    </div>
    
    <div class="alert alert-info mt-3">
      <i class="bi bi-info-circle"></i> 
      El stock de los componentes ha sido actualizado automáticamente.
    </div>
  `;
  
  modal.show();
}

// Cargar todas las órdenes del usuario
async function loadOrders() {
  const container = document.getElementById('ordersContainer');
  
  try {
    showLoading('ordersContainer');
    
    const response = await axios.get(`${API_CONFIG.GATEWAY}/orders?userId=${CURRENT_USER.id}`);
    const orders = response.data.orders || [];
    
    container.innerHTML = '';
    
    if (orders.length === 0) {
      container.innerHTML = `
        <div class="col-12">
          <div class="alert alert-info">
            <i class="bi bi-inbox"></i> No tienes órdenes todavía.
            <br><small>Explora el catálogo y compra tu primera computadora.</small>
          </div>
        </div>
      `;
      return;
    }
    
    orders.forEach(order => {
      container.innerHTML += createOrderCard(order);
    });
    
  } catch (error) {
    handleError(error, 'loadOrders');
    container.innerHTML = `
      <div class="col-12">
        <div class="alert alert-danger">
          <i class="bi bi-exclamation-triangle"></i> Error al cargar órdenes.
          Verifica que el Order Service esté activo en <code>${API_CONFIG.ORDER_SERVICE}</code>
        </div>
      </div>
    `;
  }
}

// Crear tarjeta de orden
function createOrderCard(order) {
  const orderId = order.orderId || order.SK.replace('ORDER#', '');
  const date = new Date(order.createdAt).toLocaleString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  
  const statusBadge = order.status === 'completed' ? 
    '<span class="badge bg-success"><i class="bi bi-check-circle"></i> Completada</span>' : 
    '<span class="badge bg-warning"><i class="bi bi-clock"></i> Pendiente</span>';
  
  return `
    <div class="col-md-6 col-lg-4 mb-4">
      <div class="card h-100 shadow-sm border-start border-4 border-primary">
        <div class="card-body">
          <div class="d-flex justify-content-between align-items-start mb-3">
            <h6 class="card-title mb-0">
              <i class="bi bi-receipt"></i> Orden #${orderId.substring(0, 8)}
            </h6>
            ${statusBadge}
          </div>
          
          <div class="mb-3">
            <div class="mb-2">
              <small class="text-muted">Computadora:</small>
              <p class="mb-0"><strong><i class="bi bi-laptop"></i> ${order.configName}</strong></p>
            </div>
            
            <div class="row">
              <div class="col-6">
                <small class="text-muted">Cantidad:</small>
                <p class="mb-0"><strong>${order.quantity}</strong></p>
              </div>
              <div class="col-6">
                <small class="text-muted">Total:</small>
                <p class="mb-0"><strong class="text-primary">${formatPrice(order.totalPrice)}</strong></p>
              </div>
            </div>
          </div>
          
          <div class="border-top pt-2">
            <small class="text-muted">
              <i class="bi bi-calendar"></i> ${date}
            </small>
          </div>
        </div>
      </div>
    </div>
  `;
}