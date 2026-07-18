// src/context/CommentProvider.jsx
import { useState, useCallback } from 'react';
// ✅ Remove toast import
// import toast from 'react-hot-toast';
import axios from '../api/axios';
import CommentContext from './CommentContext';

export const CommentProvider = ({ children }) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    approved: 0,
    pending: 0,
    spam: 0
  });

  // ========== Admin functions ==========

  // ✅ Fetch all comments (admin panel) - NO TOAST
  const fetchAllComments = useCallback(async (params = {}) => {
    setLoading(true);
    try {
      const { data } = await axios.get('/comments', { params });
      if (data.success) {
        setComments(data.data);
        return { success: true, data: data.data };
      }
      return { success: false, message: data.message };
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to fetch comments';
      console.error('Fetch comments error:', message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ Fetch comment stats (admin panel) - NO TOAST
  const fetchCommentStats = useCallback(async () => {
    try {
      const { data } = await axios.get('/comments/stats');
      if (data.success) {
        setStats(data.data);
        return { success: true, data: data.data };
      }
      return { success: false, message: data.message };
    } catch (err) {
      console.error('Failed to fetch comment stats:', err);
      return { success: false, message: err.message };
    }
  }, []);

  // ✅ Update comment status (admin panel) - NO TOAST
  const updateCommentStatus = async (id, status) => {
    try {
      const { data } = await axios.put(`/comments/${id}/status`, { status });
      if (data.success) {
        setComments(prev => prev.map(comment => 
          comment._id === id ? data.data : comment
        ));
        // ✅ NO toast here - let component handle it
        return { success: true, data: data.data };
      }
      return { success: false, message: data.message };
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to update comment status';
      console.error('Update comment status error:', message);
      return { success: false, message };
    }
  };

  // ✅ Delete comment (admin + frontend) - NO TOAST
  const deleteComment = async (id) => {
    try {
      const { data } = await axios.delete(`/comments/${id}`);
      if (data.success) {
        setComments(prev => prev.filter(comment => comment._id !== id));
        // ✅ NO toast here - let component handle it
        return { success: true };
      }
      return { success: false, message: data.message };
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to delete comment';
      console.error('Delete comment error:', message);
      return { success: false, message };
    }
  };

  // ✅ Add reply (admin) - NO TOAST
  const addReply = async (commentId, replyData) => {
    try {
      const { data } = await axios.post(`/comments/${commentId}/replies`, replyData);
      if (data.success) {
        setComments(prev => prev.map(comment => {
          if (comment._id === commentId) {
            return {
              ...comment,
              replies: [...(comment.replies || []), data.data]
            };
          }
          return comment;
        }));
        // ✅ NO toast here - let component handle it
        return { success: true, data: data.data };
      }
      return { success: false, message: data.message };
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to add reply';
      console.error('Add reply error:', message);
      return { success: false, message };
    }
  };

  // ========== Public frontend functions ==========

  // ✅ Fetch comments for a specific blog - NO TOAST
  const fetchCommentsByBlog = useCallback(async (blogId, params = {}) => {
    setLoading(true);
    try {
      const { data } = await axios.get('/comments', {
        params: { blogId, ...params }
      });
      if (data.success) {
        return { success: true, data: data.data, count: data.count };
      }
      return { success: false, message: data.message };
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to fetch comments';
      console.error('Fetch comments by blog error:', message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ Create a new comment (public) - NO TOAST
  const createComment = async ({ blogId, name, email, content }) => {
    try {
      const { data } = await axios.post('/comments', {
        blogId,
        name,
        email,
        content
      });
      if (data.success) {
        // ✅ NO toast here - let component handle it
        return { success: true, data: data.data };
      }
      return { success: false, message: data.message };
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to post comment';
      console.error('Create comment error:', message);
      return { success: false, message };
    }
  };

  // ✅ Update comment content (frontend) - NO TOAST
  const updateComment = async (commentId, content) => {
    try {
      const { data } = await axios.put(`/comments/${commentId}`, { content });
      if (data.success) {
        // ✅ NO toast here - let component handle it
        return { success: true, data: data.data };
      }
      return { success: false, message: data.message };
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to update comment';
      console.error('Update comment error:', message);
      return { success: false, message };
    }
  };

  // ✅ Like a comment (public) - NO TOAST
  const likeComment = async (commentId) => {
    try {
      const { data } = await axios.put(`/comments/${commentId}/like`);
      if (data.success) {
        return { success: true, likes: data.likes, isLiked: data.isLiked };
      }
      return { success: false, message: data.message };
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to like comment';
      console.error('Like comment error:', message);
      return { success: false, message };
    }
  };

  const value = {
    // state
    comments,
    loading,
    stats,
    // admin functions
    fetchAllComments,
    fetchCommentStats,
    updateCommentStatus,
    deleteComment,
    addReply,
    // public frontend functions
    fetchCommentsByBlog,
    createComment,
    updateComment,
    likeComment,
  };

  return (
    <CommentContext.Provider value={value}>
      {children}
    </CommentContext.Provider>
  );
};

export default CommentProvider;