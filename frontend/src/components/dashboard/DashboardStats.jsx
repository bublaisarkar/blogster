// components/dashboard/DashboardStats.jsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useBlog from '../../hooks/useBlog';

const DashboardStats = () => {
  const navigate = useNavigate();
  const { stats, statsLoading, fetchBlogStats } = useBlog();

  useEffect(() => {
    fetchBlogStats();
  }, [fetchBlogStats]);

  const formatViews = (views) => {
    if (views >= 1000) return (views / 1000).toFixed(1) + 'K';
    return views.toString();
  };

  const handleTotalBlogsClick = () => navigate('/dashboard/blog-lists');
  const handleCommentsClick = () => navigate('/dashboard/comments');
  const handleDraftsCardClick = () => navigate('/dashboard/blog-lists?status=draft');

  // ✅ Use stats from context
  const statsData = [
    {
      id: 1,
      title: 'Total Blogs',
      value: stats.total || 0,
      change: `${stats.published || 0} published`,
      icon: 'fa-newspaper',
      bgColor: 'bg-indigo-100',
      iconColor: 'text-indigo-600',
      trend: stats.published > 0 ? 'up' : 'neutral',
      onClick: handleTotalBlogsClick,
      clickable: true,
    },
    {
      id: 2,
      title: 'Comments',
      value: stats.totalComments || 0,
      change: `${stats.totalLikes || 0} likes`,
      icon: 'fa-comments',
      bgColor: 'bg-emerald-100',
      iconColor: 'text-emerald-600',
      trend: stats.totalComments > 0 ? 'up' : 'neutral',
      onClick: handleCommentsClick,
      clickable: true,
    },
    {
      id: 3,
      title: 'Drafts',
      value: stats.drafts || 0,
      change: stats.drafts === 0 ? 'No drafts saved' : `${stats.drafts} draft(s)`,
      icon: 'fa-file-alt',
      bgColor: 'bg-amber-100',
      iconColor: 'text-amber-600',
      trend: stats.drafts > 0 ? 'up' : 'neutral',
      onClick: handleDraftsCardClick,
      clickable: true,
    },
    {
      id: 4,
      title: 'Total Views',
      value: formatViews(stats.totalViews || 0),
      change: `${stats.total || 0} total posts`,
      icon: 'fa-eye',
      bgColor: 'bg-purple-100',
      iconColor: 'text-purple-600',
      trend: stats.totalViews > 0 ? 'up' : 'neutral',
      clickable: false,
    },
  ];

  if (statsLoading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-2xl p-5 border border-[#edebf5] shadow-sm animate-pulse">
            <div className="flex items-center justify-between">
              <div>
                <div className="h-4 w-20 bg-gray-200 rounded"></div>
                <div className="h-8 w-12 bg-gray-200 rounded mt-2"></div>
              </div>
              <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
            </div>
            <div className="mt-3 h-3 w-24 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
      {statsData.map((stat) => (
        <div
          key={stat.id}
          className={`bg-white rounded-2xl p-5 border border-[#edebf5] shadow-sm ${stat.clickable ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}
          onClick={stat.onClick}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#6b6b84] font-medium">{stat.title}</p>
              <p className="text-2xl sm:text-3xl font-bold text-[#14141f] mt-1">{stat.value}</p>
            </div>
            <div className={`w-12 h-12 ${stat.bgColor} rounded-xl flex items-center justify-center`}>
              <i className={`fas ${stat.icon} ${stat.iconColor} text-xl`}></i>
            </div>
          </div>
          <div className={`mt-3 text-xs ${stat.trend === 'up' ? 'text-emerald-600' : 'text-[#6b6b84]'}`}>
            {stat.trend === 'up' && <i className="fas fa-arrow-up mr-1"></i>}
            {stat.trend === 'neutral' && <i className="far fa-clock mr-1"></i>}
            {stat.change}
          </div>
        </div>
      ))}
    </div>
  );
};

export default DashboardStats;