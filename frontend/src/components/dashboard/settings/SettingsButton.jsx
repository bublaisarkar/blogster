
const SettingsButton = ({ 
  children, 
  onClick, 
  type = 'button', 
  variant = 'primary',
  className = ''
}) => {
  const variants = {
    primary: 'bg-indigo-600 hover:bg-indigo-700 text-white',
    danger: 'bg-red-600 hover:bg-red-700 text-white',
    outline: 'border border-[#e6e6ed] bg-white hover:bg-[#faf9f6] text-[#2d2d3f]'
  };

  return (
    <button 
      type={type}
      onClick={onClick}
      className={`px-6 py-2.5 rounded-xl font-medium transition text-sm ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

export default SettingsButton;