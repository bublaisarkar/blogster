// components/articles/FilterButtons.jsx
const FilterButtons = ({ activeFilter, onFilterChange, categories = [] }) => {
  // "All" filter is always included
  const allFilter = { id: 'all', label: 'All', icon: null };
  
  // Map categories to filter options
  const filterOptions = [
    allFilter,
    ...categories.map(cat => ({
      id: cat.slug || cat._id,      // use slug or id as filter value
      label: cat.name,
      icon: cat.icon || 'fa-tag'    // fallback icon
    }))
  ];

  return (
    <div className="flex flex-wrap gap-1.5 sm:gap-2">
      {filterOptions.map((filter) => (
        <button
          key={filter.id}
          className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium border transition ${
            activeFilter === filter.id
              ? 'bg-indigo-600 text-white border-indigo-600'
              : 'bg-white text-[#2d2d3f] border-[#e6e6ed] hover:bg-[#f0eff5]'
          }`}
          onClick={() => onFilterChange(filter.id)}
        >
          {filter.icon && <i className={`fas ${filter.icon} mr-1`}></i>}
          {filter.label}
        </button>
      ))}
    </div>
  );
};

export default FilterButtons;