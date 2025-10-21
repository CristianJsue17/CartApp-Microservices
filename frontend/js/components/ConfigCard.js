const ConfigCard = ({ config, onViewDetails, onAddToCart }) => {
  const configId = config.PK.replace('CONFIG#', '');
  
  return (
    <div className="bg-white rounded-xl shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 overflow-hidden">
      {/* Header con gradiente */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-4">
        <div className="flex items-center justify-between text-white">
          <h3 className="text-xl font-bold flex items-center">
            <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            {config.name}
          </h3>
        </div>
      </div>
      
      {/* Body */}
      <div className="p-6">
        <p className="text-gray-600 text-sm mb-4 h-12 overflow-hidden">
          {config.description || 'Sin descripción disponible'}
        </p>
        
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
            </svg>
            <span>{config.componentCount || 0} componentes</span>
          </div>
        </div>
        
        {/* Precio */}
        <div className="mb-6">
          <span className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            {utils.formatPrice(config.price)}
          </span>
        </div>
        
        {/* Botones */}
        <div className="space-y-2">
          <button
            onClick={() => onAddToCart(configId, config.name, config.price)}
            className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-3 rounded-lg transition-all transform hover:scale-105 shadow-lg"
          >
            <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            Agregar al Carrito
          </button>
          
          <button
            onClick={() => onViewDetails(configId)}
            className="w-full bg-purple-100 hover:bg-purple-200 text-purple-700 font-semibold py-3 rounded-lg transition-all"
          >
            <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            Ver Detalles
          </button>
        </div>
      </div>
    </div>
  );
};
