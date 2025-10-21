const ConfigDetailModal = ({ isOpen, onClose, config, components, onBuyNow }) => {
  const { useState } = React;
  const [quantity, setQuantity] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  
  if (!isOpen || !config) return null;
  
  const canPurchase = components.every(comp => comp.component.stock >= comp.quantity);
  
  const handleBuyNow = async () => {
    setIsProcessing(true);
    await onBuyNow(quantity);
    setIsProcessing(false);
  };
  
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose}></div>
      
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-4 rounded-t-2xl z-10">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold flex items-center">
                <svg className="w-7 h-7 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                {config.name}
              </h2>
              <button onClick={onClose} className="text-white hover:text-gray-200 text-3xl font-bold">
                ×
              </button>
            </div>
          </div>
          
          {/* Body */}
          <div className="p-6">
            {/* Description */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center">
                <svg className="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Descripción
              </h3>
              <p className="text-gray-600">{config.description || 'Sin descripción disponible'}</p>
            </div>
            
            {/* Components */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                <svg className="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Componentes Incluidos
              </h3>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Componente</th>
                      <th className="px-4 py-2 text-center text-sm font-semibold text-gray-700">Cantidad</th>
                      <th className="px-4 py-2 text-center text-sm font-semibold text-gray-700">Stock</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {components.map((comp, idx) => {
                      const hasStock = comp.component.stock >= comp.quantity;
                      return (
                        <tr key={idx} className={!hasStock ? 'bg-red-50' : 'hover:bg-gray-50'}>
                          <td className="px-4 py-3">
                            <div className="font-medium text-gray-800">{comp.component.name}</div>
                            {comp.component.specs && (
                              <div className="flex flex-wrap gap-1 mt-1">
                                {Object.entries(comp.component.specs).map(([key, value]) => (
                                  <span key={key} className="text-xs bg-gray-100 px-2 py-0.5 rounded">
                                    {key}: {value}
                                  </span>
                                ))}
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-semibold">
                              {comp.quantity}x
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                              hasStock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {comp.component.stock}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
            
            {!canPurchase && (
              <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-yellow-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <span className="text-yellow-800 font-semibold">
                    Algunos componentes tienen stock insuficiente
                  </span>
                </div>
              </div>
            )}
            
            {/* Price & Quantity */}
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-6 mb-6">
              <div className="flex justify-between items-center mb-4">
                <span className="text-gray-700 font-semibold">Precio Total:</span>
                <span className="text-4xl font-bold text-purple-600">
                  {utils.formatPrice(config.price)}
                </span>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Cantidad a Ordenar:
                </label>
                <input 
                  type="number" 
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, Math.min(10, parseInt(e.target.value) || 1)))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  min="1"
                  max="10"
                />
                <p className="text-xs text-gray-500 mt-1">Máximo 10 unidades por orden</p>
              </div>
            </div>
          </div>
          
          {/* Footer */}
          <div className="sticky bottom-0 bg-gray-50 px-6 py-4 rounded-b-2xl flex space-x-3">
            <button 
              onClick={onClose}
              className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg hover:bg-gray-300 font-semibold"
            >
              Cerrar
            </button>
            <button 
              onClick={handleBuyNow}
              disabled={isProcessing || !canPurchase}
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
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Comprar Ahora
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};