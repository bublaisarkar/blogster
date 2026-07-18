
const StatusBadge = ({ status }) => {
  const statusMap = {
    'Published': 'status-published',
    'Draft': 'status-draft',
    'Archived': 'status-archived',
    'Approved': 'status-approved',
    'Pending': 'status-pending',
    'Spam': 'status-spam',
    'Active': 'status-active',
    'Inactive': 'status-inactive'
  };
  
  const iconMap = {
    'Published': 'fa-check-circle',
    'Draft': 'fa-pencil-alt',
    'Archived': 'fa-archive',
    'Approved': 'fa-check-circle',
    'Pending': 'fa-clock',
    'Spam': 'fa-exclamation-triangle',
    'Active': 'fa-check-circle',
    'Inactive': 'fa-times-circle'
  };
  
  const className = statusMap[status] || 'status-published';
  const icon = iconMap[status] || 'fa-check-circle';

  return (
    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${className}`}>
      <i className={`fas ${icon} mr-1`}></i> {status}
    </span>
  );
};

export default StatusBadge;