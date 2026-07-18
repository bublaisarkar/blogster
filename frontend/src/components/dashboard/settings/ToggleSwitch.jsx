
const ToggleSwitch = ({ checked, onChange, label, description }) => {
  return (
    <div className="flex items-center justify-between p-4 bg-[#faf9f6] rounded-xl">
      <div>
        {label && <p className="font-medium text-[#1e1e2a]">{label}</p>}
        {description && <p className="text-sm text-[#6b6b84]">{description}</p>}
      </div>
      <label className="relative inline-flex items-center cursor-pointer">
        <input 
          type="checkbox" 
          className="sr-only peer"
          checked={checked}
          onChange={onChange}
        />
        <div className={`w-12 h-6 rounded-full shadow-inner transition ${checked ? 'bg-indigo-600' : 'bg-[#d1d0db]'}`}></div>
        <div className={`absolute w-5 h-5 bg-white rounded-full shadow left-0.5 top-0.5 transition ${checked ? 'translate-x-full' : ''}`}></div>
      </label>
    </div>
  );
};

export default ToggleSwitch;