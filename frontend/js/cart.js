// frontend/js/cart.js

// Verificar disponibilidad de stock para una configuración
async function checkAvailability(configId) {
  const quantity = parseInt(document.getElementById('orderQuantity').value);
  const modal = new bootstrap.Modal(document.getElementById('availabilityModal'));
  const modalBody = document.getElementById('availabilityModalBody');
  
  if (quantity < 1) {
    showNotification('La cantidad debe ser mayor a 0', 'warning');
    return;
  }
  
  try {
    modalBody.innerHTML = '<div class="text-center py-4"><div class="spinner-border text-primary"></div></div>';
    modal.show();
    
    const response = await axios.post(`${API_CONFIG.GATEWAY}/api/cart/check-availability`, {
      configId: configId,
      quantity: quantity
    });
    
    const { available, details, insufficientComponents, message } = response.data;
    
    let html = `
      <div class="alert alert-${available ? 'success' : 'warning'} d-flex align-items-center">
        <i class="bi bi-${available ? 'check-circle-fill' : 'exclamation-triangle-fill'} fs-4 me-3"></i>
        <div>
          <strong>${message}</strong>
          <br>
          <small>Verificando disponibilidad para ${quantity} unidad(es)</small>
        </div>
      </div>
      
      <h6 class="mt-4"><i class="bi bi-list-check"></i> Detalles por Componente:</h6>
      <div class="table-responsive">
        <table class="table table-sm table-hover">
          <thead class="table-light">
            <tr>
              <th>Componente</th>
              <th class="text-center">Requerido</th>
              <th class="text-center">Disponible</th>
              <th class="text-center">Estado</th>
            </tr>
          </thead>
          <tbody>
    `;
    
    details.forEach(detail => {
      const icon = detail.sufficient ? 
        '<i class="bi bi-check-circle-fill text-success fs-5"></i>' : 
        '<i class="bi bi-x-circle-fill text-danger fs-5"></i>';
      
      html += `
        <tr class="${!detail.sufficient ? 'table-danger' : ''}">
          <td>
            <strong>${detail.componentName}</strong>
          </td>
          <td class="text-center">
            <span class="badge bg-primary">${detail.required}</span>
          </td>
          <td class="text-center">
            <span class="badge ${detail.sufficient ? 'bg-success' : 'bg-danger'}">
              ${detail.available}
            </span>
          </td>
          <td class="text-center">
            ${icon}
            ${!detail.sufficient ? `<br><small class="text-danger fw-bold">Faltan: ${detail.missing}</small>` : ''}
          </td>
        </tr>
      `;
    });
    
    html += `
          </tbody>
        </table>
      </div>
    `;
    
    if (!available && insufficientComponents) {
      html += `
        <div class="alert alert-danger mt-3">
          <h6 class="alert-heading"><i class="bi bi-exclamation-octagon"></i> Stock Insuficiente</h6>
          <p class="mb-0">No se puede completar la orden. Los siguientes componentes no tienen stock suficiente:</p>
          <ul class="mb-0 mt-2">
            ${insufficientComponents.map(comp => 
              `<li><strong>${comp.componentName}</strong>: Necesitas ${comp.required}, disponible ${comp.available}</li>`
            ).join('')}
          </ul>
        </div>
      `;
    } else if (available) {
      html += `
        <div class="alert alert-success mt-3">
          <i class="bi bi-check-circle-fill"></i> 
          <strong>¡Perfecto!</strong> Hay stock suficiente para completar tu orden.
        </div>
      `;
    }
    
    modalBody.innerHTML = html; 
    
  } catch (error) {
    handleError(error, 'checkAvailability');
    modal.hide();
  }
}