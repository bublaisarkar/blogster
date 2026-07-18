
const BlogFilters = ({ 
  searchTerm, 
  onSearchChange, 
  statusFilter, 
  onStatusChange, 
  sortFilter, 
  onSortChange 
}) => {
  // Handle search with debounce (optional - you can implement in parent)
  const handleSearchChange = (e) => {
    onSearchChange(e.target.value);
  };

  // Clear search
  const handleClearSearch = () => {
    onSearchChange('');
  };

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#edebf5] shadow-sm mb-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        {/* Search Input */}
        <div className="relative flex-1 w-full">
          <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-[#908db0]"></i>
          <input 
            type="text" 
            placeholder="Search blogs by title..." 
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full pl-11 pr-10 py-2.5 rounded-xl border border-[#e6e6ed] bg-[#faf9f6] focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition text-sm"
          />
          {searchTerm && (
            <button
              onClick={handleClearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#908db0] hover:text-[#1e1e2a] transition"
              title="Clear search"
            >
              <i className="fas fa-times-circle"></i>
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <select 
            value={statusFilter}
            onChange={(e) => onStatusChange(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-[#e6e6ed] bg-[#faf9f6] focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition text-sm min-w-[130px]"
          >
            <option value="all">All Status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>

          <select 
            value={sortFilter}
            onChange={(e) => onSortChange(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-[#e6e6ed] bg-[#faf9f6] focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition text-sm min-w-[130px]"
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="title">Title A-Z</option>
            <option value="title-desc">Title Z-A</option>
          </select>

          {/* Optional: Reset Filters Button */}
          {(searchTerm || statusFilter !== 'all' || sortFilter !== 'newest') && (
            <button
              onClick={() => {
                onSearchChange('');
                onStatusChange('all');
                onSortChange('newest');
              }}
              className="px-4 py-2.5 rounded-xl border border-[#e6e6ed] bg-[#faf9f6] hover:bg-[#f0eff5] transition text-sm text-[#6b6b84] hover:text-[#1e1e2a]"
              title="Reset filters"
            >
              <i className="fas fa-undo"></i>
            </button>
          )}
        </div>
      </div>

      {/* Active Filters Display */}
      {(searchTerm || statusFilter !== 'all' || sortFilter !== 'newest') && (
        <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-[#e6e6ed]">
          <span className="text-xs text-[#6b6b84]">Active filters:</span>
          {searchTerm && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs">
              Search: {searchTerm}
              <button
                onClick={handleClearSearch}
                className="hover:text-red-600 transition"
              >
                <i className="fas fa-times-circle text-xs"></i>
              </button>
            </span>
          )}
          {statusFilter !== 'all' && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs capitalize">
              Status: {statusFilter}
              <button
                onClick={() => onStatusChange('all')}
                className="hover:text-red-600 transition"
              >
                <i className="fas fa-times-circle text-xs"></i>
              </button>
            </span>
          )}
          {sortFilter !== 'newest' && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs capitalize">
              Sort: {sortFilter.replace('-', ' ')}
              <button
                onClick={() => onSortChange('newest')}
                className="hover:text-red-600 transition"
              >
                <i className="fas fa-times-circle text-xs"></i>
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default BlogFilters;