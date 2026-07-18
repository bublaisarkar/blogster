
const SettingsTabs = ({ tabs, activeTab, onTabChange }) => {
  return (
    <div className="border-b border-[#e6e6ed] px-4 sm:px-6 py-3 overflow-x-auto">
      <div className="flex gap-1 min-w-max">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition flex items-center gap-2 ${
              activeTab === tab.id
                ? 'bg-indigo-600 text-white'
                : 'text-[#2d2d3f] hover:bg-[#f0eff5]'
            }`}
            onClick={() => onTabChange(tab.id)}
          >
            <i className={`fas ${tab.icon}`}></i> {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SettingsTabs;