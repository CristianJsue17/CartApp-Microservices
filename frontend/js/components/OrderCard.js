const OrderCard = ({ order }) => {
  const orderId = order.orderId || order.SK.replace('ORDER#', '');
  const isCompleted = order.status === 'completed';
  
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden border-l-4 border-purple-600 hover:shadow-2xl transition-all duration-300">
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-bold text-gray-800 flex items-center">
              <svg className="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Orden #{orderId.substring(0, 8)}
            </h3>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
            isCompleted 
              ? 'bg-green-100 text-green-800' 
              : 'bg-yellow-100 text-yellow-800'
          }`}>
            {isCompleted ? '✓ Completada' : '⏳ Pendiente'}
          </span>
        </div>
        
        {/* Content */}
        <div className="space-y-3">
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="text-sm text-gray-600 mb-1">Computadora:</div>
            <div className="font-semibold text-gray-800 flex items-center">
              <svg className="w-4 h-4 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              {order.configName}
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="text-sm text-gray-600">Cantidad:</div>
              <div className="font-semibold text-gray-800">{order.quantity} unidad(es)</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Total:</div>
              <div className="text-2xl font-bold text-purple-600">
                {utils.formatPrice(order.totalPrice)}
              </div>
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center text-xs text-gray-500">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {utils.formatDate(order.createdAt)}
          </div>
        </div>
      </div>
    </div>
  );
};