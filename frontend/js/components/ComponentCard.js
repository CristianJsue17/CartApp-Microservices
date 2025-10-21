const ComponentCard = ({ component }) => {
  const stockColor = utils.getStockBadgeColor(component.stock);
  const stockText = utils.getStockText(component.stock);
  
  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 p-4 border border-gray-200">
      <div className="flex justify-between items-start mb-3">
        <h4 className="font-semibold text-gray-800 flex items-center">
          <svg className="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
          </svg>
          {component.name}
        </h4>
      </div>
      
      <div className="space-y-2 mb-3">
        <div className="text-2xl font-bold text-purple-600">
          {utils.formatPrice(component.price)}
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">
            Stock: <span className="font-semibold">{component.stock}</span>
          </span>
          <span className={`${stockColor} text-white text-xs px-2 py-1 rounded-full font-medium`}>
            {stockText}
          </span>
        </div>
      </div>
      
      {component.specs && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <div className="flex flex-wrap gap-1">
            {Object.entries(component.specs).map(([key, value]) => (
              <span key={key} className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                {key}: {value}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};