// frontend/js/catalog.js

let allConfigs = [];
let allComponents = [];

// Cargar todas las configuraciones (computadoras)
async function loadConfigs() {
  const container = document.getElementById('configsContainer');
  
  try {
    showLoading('configsContainer');
    
    const response = await axios.get(`${API_CONFIG.GATEWAY}/configs`);
    allConfigs = response.data.configs || [];
    
    container.innerHTML = '';
    
    if (allConfigs.length === 0) {
      container.innerHTML = `
        <div class="col-12">
          <div class="alert alert-info">
            <i class="bi bi-info-circle"></i> No hay computadoras disponibles en el catálogo
          </div>
        </div>
      `;
      return;
    }
    
    allConfigs.forEach(config => {
      container.innerHTML += createConfigCard(config);
    });
    
  } catch (error) {
    handleError(error, 'loadConfigs');
    container.innerHTML = `
      <div class="col-12">
        <div class="alert alert-danger">
          <i class="bi bi-exclamation-triangle"></i> Error al cargar el catálogo. 
          Verifica que el Catalog Service esté activo en <code>${API_CONFIG.CATALOG_SERVICE}</code>
        </div>
      </div>
    `;
  }
}

// Cargar todos los componentes individuales
async function loadComponents() {
  const container = document.getElementById('componentsContainer');
  
  try {
    const response = await axios.get(`${API_CONFIG.GATEWAY}/components`);
    allComponents = response.data.components || [];
    
    container.innerHTML = '';
    
    if (allComponents.length === 0) {
      container.innerHTML = `
        <div class="col-12">
          <div class="alert alert-info">No hay componentes disponibles</div>
        </div>
      `;
      return;
    }
    
    allComponents.forEach(component => {
      container.innerHTML += createComponentCard(component);
    });
    
  } catch (error) {
    handleError(error, 'loadComponents');
  }
}

// Crear tarjeta de computadora
function createConfigCard(config) {
  const configId = config.PK.replace('CONFIG#', '');
  
  return `
    <div class="col-md-6 col-lg-4">
      <div class="card h-100 shadow-sm">
        <div class="card-body d-flex flex-column">
          <div class="d-flex justify-content-between align-items-start mb-3">
            <h5 class="card-title mb-0">
              <i class="bi bi-laptop text-primary"></i> ${config.name}
            </h5>
          </div>
          
          <p class="card-text text-muted flex-grow-1">${config.description || 'Sin descripción'}</p>
          
          <div class="mb-3">
            <small class="text-muted">
              <i class="bi bi-cpu"></i> ${config.componentCount || 0} componentes
            </small>
          </div>
          
          <div class="price-tag text-primary mb-3" style="font-size: 1.75rem; font-weight: bold;">
            ${formatPrice(config.price)}
          </div>
          
          <div class="d-grid gap-2">
            <button class="btn btn-success mb-2" onclick="addToCart('${configId}', '${config.name}', ${config.price})">
              <i class="bi bi-cart-plus"></i> Agregar al Carrito
            </button>
            <button class="btn btn-outline-primary" onclick="viewConfigDetails('${configId}')">
              <i class="bi bi-eye"></i> Ver Detalles
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
}

// Crear tarjeta de componente
function createComponentCard(component) {
  const componentId = component.PK.replace('COMPONENT#', '');
  const stockBadge = getStockBadge(component.stock);
  
  return `
    <div class="col-md-6 col-lg-3">
      <div class="card h-100">
        <div class="card-body">
          <div class="d-flex justify-content-between align-items-start mb-2">
            <h6 class="card-title mb-0"><i class="bi bi-cpu"></i> ${component.name}</h6>
          </div>
          
          <div class="mb-2">
            <strong class="text-primary">${formatPrice(component.price)}</strong>
          </div>
          
          <div class="mb-2">
            <small class="text-muted">Stock: <strong>${component.stock}</strong></small>
            <div class="mt-1">${stockBadge}</div>
          </div>
          
          ${component.specs ? `<div class="mt-2">${formatSpecs(component.specs)}</div>` : ''}
        </div>
      </div>
    </div>
  `;
}

// Ver detalles de una computadora
async function viewConfigDetails(configId) {
  const modal = new bootstrap.Modal(document.getElementById('configModal'));
  const modalTitle = document.getElementById('configModalTitle');
  const modalBody = document.getElementById('configModalBody');
  const checkBtn = document.getElementById('checkAvailabilityBtn');
  const orderBtn = document.getElementById('createOrderBtn');
  
  try {
    modalBody.innerHTML = '<div class="text-center py-4"><div class="spinner-border text-primary"></div></div>';
    modal.show();
    
    const response = await axios.get(`${API_CONFIG.GATEWAY}/configs/${configId}`);
    const { config, components } = response.data;
    
    modalTitle.innerHTML = `<i class="bi bi-laptop"></i> ${config.name}`;
    
    let componentsHTML = '';
    let canPurchase = true;
    
    components.forEach(comp => {
      const hasStock = comp.component.stock >= comp.quantity;
      if (!hasStock) canPurchase = false;
      
      componentsHTML += `
        <tr class="${!hasStock ? 'table-warning' : ''}">
          <td>
            <i class="bi bi-cpu"></i> ${comp.component.name}
            ${comp.component.specs ? `<br><small class="text-muted">${formatSpecs(comp.component.specs)}</small>` : ''}
          </td>
          <td class="text-center">
            <span class="badge bg-primary">${comp.quantity}x</span>
          </td>
          <td class="text-center">
            <span class="badge ${comp.component.stock >= comp.quantity ? 'bg-success' : 'bg-danger'}">
              ${comp.component.stock}
            </span>
          </td>
        </tr>
      `;
    });
    
    modalBody.innerHTML = `
      <div class="mb-3">
        <h6><i class="bi bi-info-circle"></i> Descripción</h6>
        <p class="text-muted">${config.description || 'Sin descripción'}</p>
      </div>
      
      <div class="mb-3">
        <h6><i class="bi bi-list-check"></i> Componentes Incluidos</h6>
        <div class="table-responsive">
          <table class="table table-sm table-hover">
            <thead class="table-light">
              <tr>
                <th>Componente</th>
                <th class="text-center">Cantidad Necesaria</th>
                <th class="text-center">Stock Disponible</th>
              </tr>
            </thead>
            <tbody>
              ${componentsHTML}
            </tbody>
          </table>
        </div>
      </div>
      
      ${!canPurchase ? `
        <div class="alert alert-warning">
          <i class="bi bi-exclamation-triangle"></i> 
          <strong>Advertencia:</strong> Algunos componentes tienen stock insuficiente.
        </div>
      ` : ''}
      
      <div class="alert alert-primary d-flex justify-content-between align-items-center">
        <strong>Precio Total:</strong>
        <span class="fs-4">${formatPrice(config.price)}</span>
      </div>
      
      <div class="mb-3">
        <label for="orderQuantity" class="form-label">
          <i class="bi bi-cart"></i> Cantidad a Ordenar
        </label>
        <input type="number" class="form-control" id="orderQuantity" value="1" min="1" max="10">
        <small class="text-muted">Máximo 10 unidades por orden</small>
      </div>
    `;
    
    // Setup buttons
    checkBtn.onclick = () => checkAvailability(configId);
    orderBtn.onclick = () => createOrderFromModal(configId, config.name);
    
  } catch (error) {
    handleError(error, 'viewConfigDetails');
    modal.hide();
  }
}

// Toggle para mostrar/ocultar componentes individuales
function toggleComponentsView() {
  const componentsSection = document.getElementById('componentsSection');
  const button = event.target;
  
  if (componentsSection.style.display === 'none' || componentsSection.style.display === '') {
    componentsSection.style.display = 'block';
    button.innerHTML = '<i class="bi bi-cpu"></i> Ocultar Componentes Individuales';
  } else {
    componentsSection.style.display = 'none';
    button.innerHTML = '<i class="bi bi-cpu"></i> Ver Componentes Individuales';
  }
}