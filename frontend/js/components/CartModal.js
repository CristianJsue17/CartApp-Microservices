const CartModal = ({ isOpen, onClose, cart, onUpdateQuantity, onRemove, onClear, onCheckout }) => {
  const { useState } = React;
  const [isProcessing, setIsProcessing] = useState(false);
  
  if (!isOpen) return null;
  
  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  
  const handleCheckout = async () => {
    setIsProcessing(true);
    try {
      await onCheckout();
    } catch (error) {
      console.error('Error en checkout:', error);
    } finally {
      setIsProcessing(false);
    }
  };
  
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose}></div>
      
      {/* Modal */}
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full transform transition-all">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-4 rounded-t-2xl">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold flex items-center">
                <svg className="w-7 h-7 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Mi Carrito ({totalItems} items)
              </h2>
              <button onClick={onClose} className="text-white hover:text-gray-200 text-3xl font-bold">
                ×
              </button>
            </div>
          </div>
          
          {/* Body */}
          <div className="p-6 max-h-96 overflow-y-auto">
            {cart.length === 0 ? (
              <div className="text-center py-12">
                <svg className="w-24 h-24 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <p className="text-gray-500 text-lg mb-4">Tu carrito está vacío</p>
                <button onClick={onClose} className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700">
                  Ir al Catálogo
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {cart.map(item => {
                  const subtotal = item.price * item.quantity;
                  return (
                  <div key={item.configId} className="flex items-center border-b border-gray-200 pb-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800 flex items-center">
                        <svg className="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        {item.name}
                      </h3>
                      <p className="text-sm text-gray-500">{utils.formatPrice(item.price)} c/u</p>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center border border-gray-300 rounded-lg">
                        <button 
                          onClick={() => onUpdateQuantity(item.configId, item.quantity - 1)}
                          className="px-3 py-1 hover:bg-gray-100 text-gray-600"
                        >
                          -
                        </button>
                        <input 
                          type="number" 
                          value={item.quantity} 
                          onChange={(e) => onUpdateQuantity(item.configId, parseInt(e.target.value) || 1)}
                          className="w-16 text-center border-x border-gray-300 py-1"
                          min="1"
                          max="10"
                        />
                        <button 
                          onClick={() => onUpdateQuantity(item.configId, item.quantity + 1)}
                          className="px-3 py-1 hover:bg-gray-100 text-gray-600"
                        >
                          +
                        </button>
                      </div>
                      
                      <div className="w-24 text-right font-bold text-purple-600">
                        {utils.formatPrice(subtotal)}
                      </div>
                      
                      <button 
                        onClick={() => onRemove(item.configId)}
                        className="text-red-500 hover:text-red-700 p-2"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  );
                })}
              </div>
            )}
          </div>
          
          {/* Footer */}
          {cart.length > 0 && (
            <div className="bg-gray-50 px-6 py-4 rounded-b-2xl">
              <div className="flex justify-between items-center mb-4">
                <button 
                  onClick={onClear}
                  className="text-red-600 hover:text-red-800 font-semibold flex items-center"
                >
                  <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Vaciar Carrito
                </button>
                <div className="text-right">
                  <div className="text-sm text-gray-600">Total:</div>
                  <div className="text-3xl font-bold text-purple-600">{utils.formatPrice(total)}</div>
                </div>
              </div>
              
              <div className="flex space-x-3">
                <button 
                  onClick={onClose}
                  className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg hover:bg-gray-300 font-semibold"
                >
                  Seguir Comprando
                </button>
                <button 
                  onClick={handleCheckout}
                  disabled={isProcessing}
                  className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white py-3 rounded-lg hover:from-green-600 hover:to-green-700 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing ? (
                    <>
                      <svg className="animate-spin h-5 w-5 inline mr-2" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Procesando...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                      Proceder al Pago
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
    );
};