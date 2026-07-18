// src/components/dashboard/comments/CommentsTableRow.jsx
import StatusBadge from '../common/StatusBadge';

const CommentsTableRow = ({ comment, index, onAction, onDelete }) => {
  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return 'Invalid Date';
    }
  };

  return (
    <tr className="hover:bg-[#f8f7fc] transition">
      <td className="px-4 sm:px-6 py-4 text-sm text-[#6b6b84]">{index + 1}</td>
      <td className="px-4 sm:px-6 py-4">
        <div>
          <p className="text-sm font-medium text-[#1e1e2a]">{comment.blog?.title || 'Unknown Blog'}</p>
          <p className="text-sm text-[#6b6b84] max-w-xs truncate">{comment.content || ''}</p>
          <p className="text-xs text-[#908db0] sm:hidden mt-1">By: {comment.name || comment.author?.name || 'Anonymous'}</p>
        </div>
      </td>
      <td className="px-4 sm:px-6 py-4 text-sm text-[#6b6b84] hidden sm:table-cell">
        {formatDate(comment.createdAt)}
      </td>
      <td className="px-4 sm:px-6 py-4">
        <StatusBadge status={comment.status || 'pending'} />
      </td>
      <td className="px-4 sm:px-6 py-4">
        <div className="flex items-center gap-2">
          {comment.status === 'approved' ? (
            <button 
              onClick={() => onAction(comment, 'unapprove')}
              className="text-amber-600 hover:text-amber-800 transition text-sm" 
              title="Unapprove"
            >
              <i className="fas fa-times-circle"></i>
            </button>
          ) : (
            <button 
              onClick={() => onAction(comment, 'approve')}
              className="text-emerald-600 hover:text-emerald-800 transition text-sm" 
              title="Approve"
            >
              <i className="fas fa-check-circle"></i>
            </button>
          )}
          <button 
            onClick={() => onDelete(comment)}
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

export default CommentsTableRow;