
const SettingsInput = ({ 
  label, 
  name, 
  value, 
  onChange, 
  type = 'text', 
  placeholder, 
  rows, 
  helper,
  className = ''
}) => {
  const baseClass = "w-full px-4 py-2.5 rounded-xl border border-[#e6e6ed] bg-[#faf9f6] focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition text-sm";
  
  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-[#2d2d3f] mb-1.5">{label}</label>
      )}
      {type === 'textarea' ? (
        <textarea 
          name={name}
          value={value}
          onChange={onChange}
          rows={rows || 3}
          className={baseClass}
        />
      ) : (
        <input 
          type={type} 
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={baseClass}
        />
      )}
      {helper && <p className="text-xs text-[#6b6b84] mt-1">{helper}</p>}
    </div>
  );
};

export default SettingsInput;