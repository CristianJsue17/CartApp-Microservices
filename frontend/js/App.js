const App = () => {
  const { useState, useEffect } = React;
  
  // State management
  const [currentView, setCurrentView] = useState('catalog');
  const [configs, setConfigs] = useState([]);
  const [components, setComponents] = useState([]);
  const [orders, setOrders] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const [showComponentsSection, setShowComponentsSection] = useState(false);
  
  // Modal states
  const [cartModalOpen, setCartModalOpen] = useState(false);
  const [configDetailModal, setConfigDetailModal] = useState({ open: false, config: null, components: [] });
  
  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = cartStorage.get();
    setCart(savedCart);
  }, []);
  
  // Load data on mount
  useEffect(() => {
    loadConfigs();
    loadComponents();
  }, []);
  
  // Show notification helper
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
  };
  
  // Load configs
  const loadConfigs = async () => {
    try {
      setLoading(true);
      const response = await api.getConfigs();
      setConfigs(response.data.configs || []);
    } catch (error) {
      console.error('Error loading configs:', error);
      showNotification('Error al cargar configuraciones', 'error');
    } finally {
      setLoading(false);
    }
  };
  
  // Load components
  const loadComponents = async () => {
    try {
      const response = await api.getComponents();
      setComponents(response.data.components || []);
    } catch (error) {
      console.error('Error loading components:', error);
      showNotification('Error al cargar componentes', 'error');
    }
  };
  
  // Load orders
  const loadOrders = async () => {
    try {
      setLoading(true);
      const response = await api.getOrdersByUser(CURRENT_USER.id);
      setOrders(response.data.orders || []);
    } catch (error) {
      console.error('Error loading orders:', error);
      showNotification('Error al cargar órdenes', 'error');
    } finally {
      setLoading(false);
    }
  };
  
  // Add to cart
  const handleAddToCart = (configId, name, price) => {
    const existingItem = cart.find(item => item.configId === configId);
    
    let newCart;
    if (existingItem) {
      newCart = cart.map(item =>
        item.configId === configId
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
      showNotification(`Se agregó otra unidad de ${name}`, 'success');
    } else {
      newCart = [...cart, { configId, name, price, quantity: 1 }];
      showNotification(`${name} agregado al carrito`, 'success');
    }
    
    setCart(newCart);
    cartStorage.set(newCart);
  };
  
  // Update cart quantity
  const handleUpdateQuantity = (configId, newQuantity) => {
    if (newQuantity < 1 || newQuantity > 10) return;
    
    const newCart = cart.map(item =>
      item.configId === configId
        ? { ...item, quantity: newQuantity }
        : item
    );
    
    setCart(newCart);
    cartStorage.set(newCart);
  };
  
  // Remove from cart
  const handleRemoveFromCart = (configId) => {
    const item = cart.find(i => i.configId === configId);
    const newCart = cart.filter(item => item.configId !== configId);
    setCart(newCart);
    cartStorage.set(newCart);
    showNotification(`${item.name} eliminado del carrito`, 'info');
  };
  
  // Clear cart
  const handleClearCart = () => {
    if (confirm('¿Vaciar el carrito?')) {
      setCart([]);
      cartStorage.clear();
      showNotification('Carrito vaciado', 'info');
    }
  };
  
  // View config details
  const handleViewDetails = async (configId) => {
    try {
      const response = await api.getConfigById(configId);
      setConfigDetailModal({
        open: true,
        config: response.data.config,
        components: response.data.components
      });
    } catch (error) {
      console.error('Error loading config details:', error);
      showNotification('Error al cargar detalles', 'error');
    }
  };
  
  // Buy now from detail modal
  const handleBuyNowFromModal = async (quantity) => {
    try {
      const { config } = configDetailModal;
      const configId = config.PK.replace('CONFIG#', '');
      
      await api.createOrder(CURRENT_USER.id, configId, quantity);
      
      showNotification('¡Orden creada exitosamente!', 'success');
      setConfigDetailModal({ open: false, config: null, components: [] });
      
      // Reload data
      setTimeout(() => {
        loadConfigs();
        loadComponents();
        setCurrentView('orders');
        loadOrders();
      }, 1500);
    } catch (error) {
      console.error('Error creating order:', error);
      const errorMsg = error.response?.data?.message || 'Error al crear orden';
      showNotification(errorMsg, 'error');
    }
  };
  
  // Checkout - create orders for all cart items
  const handleCheckout = async () => {
    if (cart.length === 0) return;
    
    if (!confirm(`¿Confirmar compra de ${cart.length} producto(s)?`)) return;
    
    try {
      let successCount = 0;
      let failedItems = [];
      
      for (const item of cart) {
        try {
          await api.createOrder(CURRENT_USER.id, item.configId, item.quantity);
          successCount++;
        } catch (error) {
          failedItems.push({
            name: item.name,
            error: error.response?.data?.message || 'Error desconocido'
          });
        }
      }
      
      // Close cart modal
      setCartModalOpen(false);
      
      if (successCount === cart.length) {
        showNotification(`¡Compra exitosa! ${successCount} producto(s) ordenado(s)`, 'success');
        setCart([]);
        cartStorage.clear();
        
        setTimeout(() => {
          loadConfigs();
          loadComponents();
          setCurrentView('orders');
          loadOrders();
        }, 1500);
      } else if (successCount > 0) {
        showNotification(`Compra parcial: ${successCount} exitoso(s), ${failedItems.length} fallido(s)`, 'warning');
        
        // Remove successful items from cart
        const newCart = cart.filter(item =>
          failedItems.some(failed => failed.name === item.name)
        );
        setCart(newCart);
        cartStorage.set(newCart);
      } else {
        showNotification('Error al procesar la compra', 'error');
      }
    } catch (error) {
      console.error('Error in checkout:', error);
      showNotification('Error al procesar la compra', 'error');
    }
  };
  
  // Handle view change
  const handleViewChange = (view) => {
    setCurrentView(view);
    if (view === 'orders') {
      loadOrders();
    }
  };
  
  // Cart count
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  
  return (
    <div className="min-h-screen">
      {/* Navbar */}
      <Navbar
        currentView={currentView}
        onViewChange={handleViewChange}
        cartCount={cartCount}
        onCartClick={() => setCartModalOpen(true)}
      />
      
      {/* Main Content */}
      <div className="container mx-auto px-4 pt-20 pb-8">
        <div className="bg-white rounded-3xl shadow-2xl p-8 mt-8 min-h-[calc(100vh-140px)]">
          
          {/* Catalog View */}
          {currentView === 'catalog' && (
            <div className="fade-in">
              {/* Header */}
              <div className="mb-8">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                  Catálogo de Computadoras
                </h1>
                <p className="text-gray-600">Selecciona la computadora perfecta para ti</p>
              </div>
              
              {/* Toggle Components Button */}
              <div className="mb-6">
                <button
                  onClick={() => setShowComponentsSection(!showComponentsSection)}
                  className="bg-purple-100 hover:bg-purple-200 text-purple-700 px-4 py-2 rounded-lg font-semibold transition-all"
                >
                  <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                  </svg>
                  {showComponentsSection ? 'Ocultar' : 'Ver'} Componentes Individuales
                </button>
              </div>
              
              {/* Configs Grid */}
              {loading ? (
                <div className="flex justify-center items-center py-20">
                  <svg className="animate-spin h-12 w-12 text-purple-600" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
              ) : configs.length === 0 ? (
                <div className="text-center py-20">
                  <svg className="w-20 h-20 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                  <p className="text-gray-500 text-lg">No hay computadoras disponibles</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {configs.map(config => (
                    <ConfigCard
                      key={config.PK}
                      config={config}
                      onViewDetails={handleViewDetails}
                      onAddToCart={handleAddToCart}
                    />
                  ))}
                </div>
              )}
              
              {/* Components Section */}
              {showComponentsSection && (
                <div className="mt-12 pt-8 border-t border-gray-200">
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-6">
                    Componentes Disponibles
                  </h2>
                  
                  {components.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No hay componentes disponibles</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {components.map(component => (
                        <ComponentCard key={component.PK} component={component} />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
          
          {/* Orders View */}
          {currentView === 'orders' && (
            <div className="fade-in">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                    Mis Órdenes
                  </h1>
                  <p className="text-gray-600">Historial de compras realizadas</p>
                </div>
                <button
                  onClick={loadOrders}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-semibold transition-all"
                >
                  <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Actualizar
                </button>
              </div>
              
              {loading ? (
                <div className="flex justify-center items-center py-20">
                  <svg className="animate-spin h-12 w-12 text-purple-600" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-20">
                  <svg className="w-20 h-20 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                  <p className="text-gray-500 text-lg mb-4">No tienes órdenes todavía</p>
                  <button
                    onClick={() => setCurrentView('catalog')}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-semibold"
                  >
                    Ir al Catálogo
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {orders.map(order => (
                    <OrderCard key={order.SK} order={order} />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Cart Modal */}
      <CartModal
        isOpen={cartModalOpen}
        onClose={() => setCartModalOpen(false)}
        cart={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemove={handleRemoveFromCart}
        onClear={handleClearCart}
        onCheckout={handleCheckout}
      />
      
      {/* Config Detail Modal */}
      <ConfigDetailModal
        isOpen={configDetailModal.open}
        onClose={() => setConfigDetailModal({ open: false, config: null, components: [] })}
        config={configDetailModal.config}
        components={configDetailModal.components}
        onBuyNow={handleBuyNowFromModal}
      />
      
      {/* Notification */}
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
    </div>
  );
};

// Render App
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);