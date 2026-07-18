import BlogTableRow from './BlogTableRow';

const BlogTable = ({ 
  blogs = [], 
  loading = false, 
  onEdit, 
  onDelete, 
  onUnpublish, 
  onPublish 
}) => {
  // Loading state
  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-[#edebf5] shadow-sm overflow-hidden">
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-[#6b6b84]">Loading blogs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-[#edebf5] shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-4 sm:px-6 py-4 border-b border-[#e6e6ed] flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-[#14141f] flex items-center gap-2">
          <i className="fas fa-list-ul text-indigo-600"></i> All Blogs
          <span className="text-sm font-normal text-[#6b6b84]">({blogs.length} total)</span>
        </h2>
       
      </div>

      {/* Empty State */}
      {blogs.length === 0 ? (
        <div className="p-8 text-center">
          <div className="flex flex-col items-center gap-3">
            <i className="fas fa-file-alt text-4xl text-[#e6e6ed]"></i>
            <p className="text-[#6b6b84]">No blogs found. Create your first blog post!</p>
            <button 
              onClick={() => window.location.href = '/dashboard/add-blog'}
              className="mt-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl font-medium transition text-sm flex items-center gap-2"
            >
              <i className="fas fa-plus"></i> Create Blog
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#e6e6ed] bg-[#faf9f6]">
                  <th className="text-left px-4 sm:px-6 py-3 text-xs font-semibold text-[#6b6b84] uppercase tracking-wider">#</th>
                  <th className="text-left px-4 sm:px-6 py-3 text-xs font-semibold text-[#6b6b84] uppercase tracking-wider">Blog Title</th>
                  <th className="text-left px-4 sm:px-6 py-3 text-xs font-semibold text-[#6b6b84] uppercase tracking-wider hidden sm:table-cell">Date</th>
                  <th className="text-left px-4 sm:px-6 py-3 text-xs font-semibold text-[#6b6b84] uppercase tracking-wider">Status</th>
                  <th className="text-left px-4 sm:px-6 py-3 text-xs font-semibold text-[#6b6b84] uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f0eef8]">
                {blogs.map((blog, index) => (
                  <BlogTableRow 
                    key={blog._id || blog.id || index}
                    blog={blog}
                    index={index}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onUnpublish={onUnpublish}
                    onPublish={onPublish}
                  />
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-4 sm:px-6 py-4 border-t border-[#e6e6ed] flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-[#6b6b84]">
              Showing 1-{Math.min(blogs.length, 10)} of {blogs.length} blogs
            </p>
            <div className="flex items-center gap-1 sm:gap-2">
              <button className="px-2 sm:px-3 py-1 rounded-lg border border-[#e6e6ed] bg-white text-sm font-medium text-[#4a4a5e] hover:bg-[#f0eff5] transition disabled:opacity-50 disabled:cursor-not-allowed">
                <i className="fas fa-chevron-left"></i>
              </button>
              <button className="px-3 sm:px-4 py-1 rounded-lg bg-indigo-600 text-white text-sm font-medium">1</button>
              {blogs.length > 10 && (
                <button className="px-3 sm:px-4 py-1 rounded-lg border border-[#e6e6ed] bg-white text-sm font-medium text-[#4a4a5e] hover:bg-[#f0eff5] transition">
                  2
                </button>
              )}
              {blogs.length > 20 && (
                <button className="px-3 sm:px-4 py-1 rounded-lg border border-[#e6e6ed] bg-white text-sm font-medium text-[#4a4a5e] hover:bg-[#f0eff5] transition">
                  3
                </button>
              )}
              <button className="px-2 sm:px-3 py-1 rounded-lg border border-[#e6e6ed] bg-white text-sm font-medium text-[#4a4a5e] hover:bg-[#f0eff5] transition">
                <i className="fas fa-chevron-right"></i>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default BlogTable;