
const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="flex items-center justify-center gap-1 sm:gap-2 mt-8 mb-12">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`px-2 sm:px-3 py-1 rounded-lg border border-[#e6e6ed] bg-white text-sm font-medium text-[#4a4a5e] hover:bg-[#f0eff5] transition ${
          currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        <i className="fas fa-chevron-left"></i>
      </button>
      
      {pages.map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`px-3 sm:px-4 py-1 rounded-lg text-sm font-medium transition ${
            currentPage === page
              ? 'bg-indigo-600 text-white'
              : 'border border-[#e6e6ed] bg-white text-[#4a4a5e] hover:bg-[#f0eff5]'
          }`}
        >
          {page}
        </button>
      ))}
      
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`px-2 sm:px-3 py-1 rounded-lg border border-[#e6e6ed] bg-white text-sm font-medium text-[#4a4a5e] hover:bg-[#f0eff5] transition ${
          currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        <i className="fas fa-chevron-right"></i>
      </button>
    </div>
  );
};

export default Pagination;