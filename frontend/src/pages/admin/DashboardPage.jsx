import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import useBlog from '../../hooks/useBlog';
import DashboardHeader from '../../components/dashboard/DashboardHeader';
import DashboardStats from '../../components/dashboard/DashboardStats';
import DashboardTable from '../../components/dashboard/DashboardTable';

const DashboardPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { blogs, loading, fetchBlogs, deleteBlog, publishBlog, unpublishBlog } = useBlog();

  // Fetch latest blogs (limit 5)
  useEffect(() => {
    fetchBlogs({ limit: 5, sortBy: 'createdAt', sortOrder: 'desc' });
  }, [fetchBlogs]);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <DashboardHeader 
        title="Dashboard"
        description={`Welcome back, ${user?.name || 'User'}! Here's what's happening with your blog.`}
        actionButton={
          <Link 
            to="/dashboard/add-blog" 
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl font-medium transition text-sm flex items-center gap-2"
          >
            <i className="fas fa-plus"></i> New Blog
          </Link>
        }
      />

      {/* Stats Cards - Pass blogs as prop */}
      <DashboardStats blogs={blogs} />

      {/* Latest Blogs Table - with action handlers */}
      <DashboardTable 
        blogs={blogs} 
        loading={loading}
        onEdit={(blog) => navigate(`/dashboard/edit-blog/${blog._id}`)}
        onDelete={deleteBlog}
        onPublish={publishBlog}
        onUnpublish={unpublishBlog}
      />
    </div>
  );
};

export default DashboardPage;