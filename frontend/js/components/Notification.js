const Notification = ({ message, type, onClose }) => {
  const { useEffect } = React;
  
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);
    
    return () => clearTimeout(timer);
  }, []);
  
  const colors = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    warning: 'bg-yellow-500',
    info: 'bg-blue-500'
  };
  
  const icons = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️'
  };
  
  return (
    <div className="fixed top-4 right-4 z-50 animate-fade-in">
      <div className={`${colors[type]} text-white px-6 py-4 rounded-lg shadow-2xl flex items-center space-x-3 max-w-md`}>
        <span className="text-2xl">{icons[type]}</span>
        <span className="flex-1">{message}</span>
        <button 
          onClick={onClose}
          className="text-white hover:text-gray-200 font-bold text-xl"
        >
          ×
        </button>
      </div>
    </div>
  );
};