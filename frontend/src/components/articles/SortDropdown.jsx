
const SortDropdown = ({ sort, onSortChange }) => {
  return (
    <div className="flex items-center gap-2">
      <i className="fas fa-sort text-[#908db0] text-sm"></i>
      <select
        value={sort}
        onChange={(e) => onSortChange(e.target.value)}
        className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border border-[#e6e6ed] bg-white text-sm font-medium text-[#2d2d3f] focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
      >
        <option value="newest">Newest</option>
        <option value="oldest">Oldest</option>
        <option value="popular">Most Popular</option>
        <option value="trending">Trending</option>
      </select>
    </div>
  );
};

export default SortDropdown;