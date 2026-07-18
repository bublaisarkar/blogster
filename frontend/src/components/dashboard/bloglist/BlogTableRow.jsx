import StatusBadge from '../common/StatusBadge';

const BlogTableRow = ({ 
  blog, 
  index, 
  onEdit, 
  onDelete, 
  onUnpublish, 
  onPublish 
}) => {
  // Format date - handles both string and Date objects
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return 'Invalid Date';
    }
  };

  // Normalize status to lowercase for consistent comparison
  const status = blog.status?.toLowerCase() || 'draft';

  // Determine if blog is published
  const isPublished = status === 'published';

  return (
    <tr className="hover:bg-[#f8f7fc] transition">
      <td className="px-4 sm:px-6 py-4 text-sm text-[#6b6b84]">{index + 1}</td>
      <td className="px-4 sm:px-6 py-4 text-sm font-medium text-[#1e1e2a]">
        {blog.title || 'Untitled'}
      </td>
      <td className="px-4 sm:px-6 py-4 text-sm text-[#6b6b84] hidden sm:table-cell">
        {formatDate(blog.createdAt || blog.date)}
      </td>
      <td className="px-4 sm:px-6 py-4">
        <StatusBadge status={blog.status || 'draft'} />
      </td>
      <td className="px-4 sm:px-6 py-4">
        <div className="flex items-center gap-2">
          {/* Edit Button */}
          <button 
            onClick={() => onEdit && onEdit(blog)}
            className="text-indigo-600 hover:text-indigo-800 transition text-sm" 
            title="Edit"
          >
            <i className="fas fa-edit"></i>
          </button>

          {/* Publish/Unpublish/Restore Button */}
          {isPublished ? (
            <button 
              onClick={() => onUnpublish && onUnpublish(blog)}
              className="text-amber-600 hover:text-amber-800 transition text-sm" 
              title="Unpublish"
            >
              <i className="fas fa-eye-slash"></i>
            </button>
          ) : status === 'archived' ? (
            <button 
              onClick={() => onPublish && onPublish(blog)}
              className="text-emerald-600 hover:text-emerald-800 transition text-sm" 
              title="Restore"
            >
              <i className="fas fa-undo"></i>
            </button>
          ) : (
            <button 
              onClick={() => onPublish && onPublish(blog)}
              className="text-emerald-600 hover:text-emerald-800 transition text-sm" 
              title="Publish"
            >
              <i className="fas fa-check"></i>
            </button>
          )}

          {/* Delete Button */}
          <button 
            onClick={() => onDelete && onDelete(blog)}
            className="text-red-500 hover:text-red-700 transition text-sm" 
            title="Delete"
          >
            <i className="fas fa-trash"></i>
          </button>
        </div>
      </td>
    </tr>
  );
};

export default BlogTableRow;