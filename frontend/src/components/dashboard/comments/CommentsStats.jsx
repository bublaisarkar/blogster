// src/components/dashboard/comments/CommentsStats.jsx

const CommentsStats = ({ stats }) => {
  const statItems = [
    {
      id: 'total',
      label: 'Total Comments',
      value: stats?.total || 0,
      bg: 'bg-indigo-100',
      icon: 'fa-comments',
      iconColor: 'text-indigo-600'
    },
    {
      id: 'approved',
      label: 'Approved',
      value: stats?.approved || 0,
      bg: 'bg-emerald-100',
      icon: 'fa-check-circle',
      iconColor: 'text-emerald-600'
    },
    {
      id: 'pending',
      label: 'Pending',
      value: stats?.pending || 0,
      bg: 'bg-amber-100',
      icon: 'fa-clock',
      iconColor: 'text-amber-600'
    },
    {
      id: 'spam',
      label: 'Spam',
      value: stats?.spam || 0,
      bg: 'bg-red-100',
      icon: 'fa-exclamation-triangle',
      iconColor: 'text-red-600'
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6">
      {statItems.map((stat) => (
        <div key={stat.id} className="bg-white rounded-2xl p-4 sm:p-5 border border-[#edebf5] shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-[#6b6b84] font-medium">{stat.label}</p>
              <p className="text-xl sm:text-2xl font-bold text-[#14141f] mt-1">{stat.value}</p>
            </div>
            <div className={`w-10 h-10 sm:w-12 sm:h-12 ${stat.bg} rounded-xl flex items-center justify-center`}>
              <i className={`fas ${stat.icon} ${stat.iconColor} text-lg sm:text-xl`}></i>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CommentsStats;