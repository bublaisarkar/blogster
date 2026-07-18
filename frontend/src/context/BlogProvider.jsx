// context/BlogProvider.jsx
import { useState, useCallback } from 'react';
// ✅ Remove toast import
// import toast from 'react-hot-toast';
import axios from '../api/axios';
import BlogContext from './BlogContext';

export const BlogProvider = ({ children }) => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });

  // ✅ Blog stats state
  const [stats, setStats] = useState({
    total: 0,
    published: 0,
    drafts: 0,
    archived: 0,
    totalViews: 0,
    totalComments: 0,
    totalLikes: 0,
  });
  const [statsLoading, setStatsLoading] = useState(false);

  // ✅ Fetch all blogs
  const fetchBlogs = useCallback(async (params = {}) => {
    setLoading(true);
    try {
      const { data } = await axios.get('/blogs', { params });
      if (data.success) {
        setBlogs(data.data);
        if (data.pagination) {
          setPagination(data.pagination);
        }
        return { success: true, data: data.data };
      }
      return { success: false, message: data.message };
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to fetch blogs';
      console.error('Fetch blogs error:', message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ Fetch blog statistics
  const fetchBlogStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const { data } = await axios.get('/blogs/stats');
      if (data.success) {
        setStats(data.data);
        return { success: true, data: data.data };
      }
      return { success: false, message: data.message };
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to fetch stats';
      console.error('Fetch stats error:', message);
      return { success: false, message };
    } finally {
      setStatsLoading(false);
    }
  }, []);

  // ✅ Get single blog
  const getBlog = useCallback(async (id) => {
    setLoading(true);
    try {
      const { data } = await axios.get(`/blogs/${id}`);
      if (data.success) {
        return { success: true, data: data.data };
      }
      return { success: false, message: data.message };
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to fetch blog';
      console.error('Get blog error:', message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ Create blog - NO TOAST
  const createBlog = async (blogData) => {
    setLoading(true);
    try {
      const { data } = await axios.post('/blogs', blogData);
      if (data.success) {
        setBlogs(prev => [data.data, ...prev]);
        // ✅ NO toast here - let component handle it
        return { success: true, data: data.data };
      }
      return { success: false, message: data.message };
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to create blog';
      console.error('Create blog error:', message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  // ✅ Update blog - NO TOAST
  const updateBlog = async (id, blogData) => {
    setLoading(true);
    try {
      const { data } = await axios.put(`/blogs/${id}`, blogData);
      if (data.success) {
        setBlogs(prev => prev.map(blog => 
          blog._id === id ? data.data : blog
        ));
        // ✅ NO toast here - let component handle it
        return { success: true, data: data.data };
      }
      return { success: false, message: data.message };
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to update blog';
      console.error('Update blog error:', message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  // ✅ Delete blog - NO TOAST
  const deleteBlog = async (id) => {
    setLoading(true);
    try {
      const { data } = await axios.delete(`/blogs/${id}`);
      if (data.success) {
        setBlogs(prev => prev.filter(blog => blog._id !== id));
        // ✅ NO toast here - let component handle it
        return { success: true };
      }
      return { success: false, message: data.message };
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to delete blog';
      console.error('Delete blog error:', message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  // ✅ Publish blog - NO TOAST
  const publishBlog = async (id) => {
    try {
      const { data } = await axios.put(`/blogs/${id}/publish`);
      if (data.success) {
        setBlogs(prev => prev.map(blog => 
          blog._id === id ? data.data : blog
        ));
        // ✅ NO toast here - let component handle it
        return { success: true, data: data.data };
      }
      return { success: false, message: data.message };
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to publish blog';
      console.error('Publish blog error:', message);
      return { success: false, message };
    }
  };

  // ✅ Unpublish blog - NO TOAST
  const unpublishBlog = async (id) => {
    try {
      const { data } = await axios.put(`/blogs/${id}/unpublish`);
      if (data.success) {
        setBlogs(prev => prev.map(blog => 
          blog._id === id ? data.data : blog
        ));
        // ✅ NO toast here - let component handle it
        return { success: true, data: data.data };
      }
      return { success: false, message: data.message };
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to unpublish blog';
      console.error('Unpublish blog error:', message);
      return { success: false, message };
    }
  };

  const value = {
    blogs,
    loading,
    pagination,
    stats,
    statsLoading,
    fetchBlogs,
    fetchBlogStats,
    getBlog,
    createBlog,
    updateBlog,
    deleteBlog,
    publishBlog,
    unpublishBlog
  };

  return (
    <BlogContext.Provider value={value}>
      {children}
    </BlogContext.Provider>
  );
};

export default BlogProvider;