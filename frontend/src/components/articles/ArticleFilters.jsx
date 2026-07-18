// components/articles/ArticleFilters.jsx
import SearchBar from './SearchBar';
import FilterButtons from './FilterButtons';
import SortDropdown from './SortDropdown';

const ArticleFilters = ({ 
  search, 
  onSearchChange, 
  activeFilter, 
  onFilterChange,
  sort,
  onSortChange,
  categories = []  // ✅ accept categories prop
}) => {
  return (
    <div className="bg-white rounded-2xl p-4 sm:p-6 border border-[#edebf5] shadow-sm mb-8">
      <SearchBar search={search} onSearchChange={onSearchChange} />
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-4">
        <FilterButtons 
          activeFilter={activeFilter} 
          onFilterChange={onFilterChange} 
          categories={categories}  // ✅ pass down
        />
        <SortDropdown sort={sort} onSortChange={onSortChange} />
      </div>
    </div>
  );
};

export default ArticleFilters;