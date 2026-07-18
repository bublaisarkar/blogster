// src/components/dashboard/common/RoleBadge.jsx

const RoleBadge = ({ role }) => {
  const roleMap = {
    'admin': 'bg-purple-100 text-purple-700',
    'editor': 'bg-blue-100 text-blue-700',
    'author': 'bg-emerald-100 text-emerald-700',
    'user': 'bg-gray-100 text-gray-700'
  };
  
  const displayRole = role?.charAt(0).toUpperCase() + role?.slice(1) || 'User';
  const className = roleMap[role?.toLowerCase()] || 'bg-gray-100 text-gray-700';

  return (
    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${className}`}>
      {displayRole}
    </span>
  );
};

export default RoleBadge;