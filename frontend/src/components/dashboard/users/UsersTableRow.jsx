// src/components/dashboard/users/UsersTableRow.jsx
import RoleBadge from '../common/RoleBadge';
import StatusBadge from '../common/StatusBadge';

const UsersTableRow = ({ user, index, onAction, onDelete, onEdit, currentUser }) => {
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

  // Don't show actions for current user (can't delete/block yourself)
  const isCurrentUser = currentUser?._id === user._id;

  return (
    <tr className="hover:bg-[#f8f7fc] transition">
      <td className="px-4 sm:px-6 py-4 text-sm text-[#6b6b84]">{index + 1}</td>
      <td className="px-4 sm:px-6 py-4">
        <div className="flex items-center gap-3">
          <img 
            src={user.avatar || `https://ui-avatars.com/api/?name=${user.name || 'User'}&background=4f46e5&color=fff`} 
            alt={user.name || 'User'} 
            className="w-10 h-10 rounded-full object-cover" 
          />
          <div>
            <p className="text-sm font-medium text-[#1e1e2a]">{user.name || 'Unknown'}</p>
            <p className="text-xs text-[#6b6b84] sm:hidden">{user.email || ''}</p>
          </div>
        </div>
      </td>
      <td className="px-4 sm:px-6 py-4 text-sm text-[#6b6b84] hidden sm:table-cell">{user.email || ''}</td>
      <td className="px-4 sm:px-6 py-4 text-sm text-[#6b6b84] hidden md:table-cell">
        {formatDate(user.createdAt)}
      </td>
      <td className="px-4 sm:px-6 py-4">
        <RoleBadge role={user.role || 'user'} />
      </td>
      <td className="px-4 sm:px-6 py-4">
        <StatusBadge status={user.status || 'pending'} />
      </td>
      <td className="px-4 sm:px-6 py-4">
        <div className="flex items-center gap-2">
          {/* ✅ Edit Button */}
          <button 
            onClick={() => onEdit(user)}
            className="text-indigo-600 hover:text-indigo-800 transition text-sm" 
            title="Edit"
          >
            <i className="fas fa-edit"></i>
          </button>
          
          {!isCurrentUser && (
            <>
              {user.status === 'active' ? (
                <button 
                  onClick={() => onAction(user, 'block')}
                  className="text-amber-600 hover:text-amber-800 transition text-sm" 
                  title="Block"
                >
                  <i className="fas fa-ban"></i>
                </button>
              ) : user.status === 'inactive' ? (
                <button 
                  onClick={() => onAction(user, 'activate')}
                  className="text-emerald-600 hover:text-emerald-800 transition text-sm" 
                  title="Activate"
                >
                  <i className="fas fa-check-circle"></i>
                </button>
              ) : user.status === 'pending' ? (
                <button 
                  onClick={() => onAction(user, 'approve')}
                  className="text-emerald-600 hover:text-emerald-800 transition text-sm" 
                  title="Approve"
                >
                  <i className="fas fa-check-circle"></i>
                </button>
              ) : null}
              
              <button 
                onClick={() => onDelete(user)}
                className="text-red-500 hover:text-red-700 transition text-sm" 
                title="Delete"
              >
                <i className="fas fa-trash"></i>
              </button>
            </>
          )}
        </div>
      </td>
    </tr>
  );
};

export default UsersTableRow;