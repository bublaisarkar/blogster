
const SearchBar = ({ search, onSearchChange }) => {
  return (
    <div className="relative">
      <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-[#908db0]"></i>
      <input 
        type="text" 
        placeholder="Search articles, topics, or authors..." 
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        className="w-full pl-11 pr-4 py-3 rounded-xl border border-[#e6e6ed] bg-[#faf9f6] focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition text-sm"
      />
    </div>
  );
};

export default SearchBar;