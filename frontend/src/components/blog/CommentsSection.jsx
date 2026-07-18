// src/components/blog/CommentsSection.jsx
import { useState, useEffect, useCallback, useRef } from 'react';
import toast from 'react-hot-toast';
import useAuth from '../../hooks/useAuth';
import useComment from '../../hooks/useComment';

const CommentsSection = ({ 
  postId, 
  initialComments = [], 
  commentCount: initialCount = 0,
  onCommentAdded 
}) => {
  const { user } = useAuth();
  const { 
    fetchCommentsByBlog, 
    createComment, 
    updateComment, 
    deleteComment, 
    likeComment,
    addReply
  } = useComment();

  const [comments, setComments] = useState(initialComments);
  const [commentCount, setCommentCount] = useState(initialCount);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(!initialComments.length);
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [replyText, setReplyText] = useState('');
  const hasFetched = useRef(false);

  // ✅ Fetch comments using CommentProvider
  const fetchComments = useCallback(async () => {
    if (!postId) return;
    setLoading(true);
    const result = await fetchCommentsByBlog(postId);
    if (result.success) {
      setComments(result.data);
      setCommentCount(result.count);
    }
    setLoading(false);
  }, [postId, fetchCommentsByBlog]);

  // ✅ Use ref to prevent double fetch
  useEffect(() => {
    if (postId && !initialComments.length && !hasFetched.current) {
      hasFetched.current = true;
      fetchComments();
    }
  }, [postId, initialComments.length, fetchComments]);

  // Handle new comment submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please login to comment');
      return;
    }
    if (!newComment.trim()) {
      toast.error('Please enter a comment');
      return;
    }

    setIsSubmitting(true);

    const result = await createComment({
      blogId: postId,
      name: user.name,
      email: user.email,
      content: newComment.trim()
    });

    if (result.success) {
      const newCommentData = {
        _id: result.data._id,
        author: {
          name: user.name,
          avatar: user.avatar || `https://ui-avatars.com/api/?name=${user.name.replace(' ', '+')}`
        },
        content: newComment.trim(),
        createdAt: new Date().toISOString()
      };
      setComments(prev => [newCommentData, ...prev]);
      setCommentCount(prev => prev + 1);
      setNewComment('');
      if (onCommentAdded) onCommentAdded(newCommentData);
      // ✅ Toast is handled by the provider
    }
    setIsSubmitting(false);
  };

  // Delete comment
  const handleDelete = async (commentId) => {
    if (!user) {
      toast.error('Please login to delete comments');
      return;
    }
    if (!window.confirm('Are you sure you want to delete this comment?')) return;

    const result = await deleteComment(commentId);
    if (result.success) {
      setComments(prev => prev.filter(c => c._id !== commentId));
      setCommentCount(prev => prev - 1);
      // ✅ Toast is handled by the provider
    }
  };

  // Edit comment
  const handleEdit = async (commentId) => {
    if (!user) {
      toast.error('Please login to edit comments');
      return;
    }
    if (!editText.trim()) {
      toast.error('Please enter comment text');
      return;
    }

    const result = await updateComment(commentId, editText.trim());
    if (result.success) {
      setComments(prev => prev.map(c => (c._id === commentId ? result.data : c)));
      setEditingId(null);
      setEditText('');
      // ✅ Toast is handled by the provider
    }
  };

  // Like comment
  const handleLikeComment = async (commentId) => {
    if (!user) {
      toast.error('Please login to like comments');
      return;
    }
    const result = await likeComment(commentId);
    if (result.success) {
      setComments(prev =>
        prev.map(c =>
          c._id === commentId
            ? { ...c, likes: result.likes, isLiked: result.isLiked }
            : c
        )
      );
      // ✅ No toast needed for likes (silent action)
    } else {
      toast.error(result.message || 'Failed to like comment');
    }
  };

  // Reply to comment
  const handleReply = async (commentId) => {
    if (!user) {
      toast.error('Please login to reply');
      return;
    }
    if (!replyText.trim()) {
      toast.error('Please enter a reply');
      return;
    }

    const result = await addReply(commentId, { content: replyText.trim() });
    if (result.success) {
      const newReply = {
        _id: result.data._id || Date.now(),
        author: {
          name: user.name,
          avatar: user.avatar || `https://ui-avatars.com/api/?name=${user.name.replace(' ', '+')}`
        },
        content: replyText.trim(),
        createdAt: new Date().toISOString()
      };
      setComments(prev =>
        prev.map(c =>
          c._id === commentId
            ? { ...c, replies: [...(c.replies || []), newReply] }
            : c
        )
      );
      setReplyTo(null);
      setReplyText('');
      // ✅ Toast is handled by the provider
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Just now';
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffMinutes = Math.floor(diffTime / (1000 * 60));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Loading state
  if (loading) {
    return (
      <section className="mt-12 pt-8 border-t border-[#f0eef8]">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-8 w-32 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-6 w-12 bg-gray-200 rounded-full animate-pulse"></div>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex gap-4 animate-pulse">
              <div className="w-11 h-11 bg-gray-200 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 w-32 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 w-full bg-gray-200 rounded"></div>
                <div className="h-3 w-3/4 bg-gray-200 rounded mt-1"></div>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="mt-12 pt-8 border-t border-[#f0eef8]">
      <div className="flex items-center gap-3 mb-6">
        <h3 className="text-2xl font-bold text-[#14141f] flex items-center gap-3">
          <i className="far fa-comments text-indigo-600"></i> Comments
        </h3>
        <span className="text-sm font-normal text-[#6b6b84] bg-[#f0eef8] px-3 py-1 rounded-full">
          {commentCount}
        </span>
      </div>

      {/* Comments List */}
      {comments.length === 0 ? (
        <div className="text-center py-8 bg-[#faf9f6] rounded-2xl">
          <i className="far fa-comment-dots text-4xl text-[#cbc8e0] mb-3"></i>
          <p className="text-[#6b6b84] text-sm">
            No comments yet. Be the first to share your thoughts!
          </p>
        </div>
      ) : (
        comments.map(comment => (
          <div key={comment._id || comment.id} className="flex gap-4 mb-6">
            <img
              src={
                comment.author?.avatar ||
                comment.avatar ||
                `https://ui-avatars.com/api/?name=${(
                  comment.author?.name || comment.name || 'User'
                ).replace(' ', '+')}`
              }
              alt={comment.author?.name || comment.name || 'User'}
              className="w-11 h-11 rounded-full object-cover flex-shrink-0"
            />
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="font-semibold text-[#1e1e2a]">
                  {comment.author?.name || comment.name || 'Anonymous'}
                </span>
                <span className="text-xs text-[#6b6b84]">
                  {formatDate(comment.createdAt || comment.date)}
                </span>
                {comment.editedAt && (
                  <span className="text-xs text-[#6b6b84]">(edited)</span>
                )}
                {comment.isAuthor && (
                  <span className="text-xs bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full">
                    Author
                  </span>
                )}
              </div>

              {/* Edit Mode */}
              {editingId === (comment._id || comment.id) ? (
                <div className="mt-2">
                  <textarea
                    value={editText}
                    onChange={e => setEditText(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-[#e6e6ed] focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-sm"
                    rows="3"
                  />
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => handleEdit(comment._id || comment.id)}
                      className="px-3 py-1 bg-indigo-600 text-white rounded-lg text-xs hover:bg-indigo-700 transition"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setEditingId(null);
                        setEditText('');
                      }}
                      className="px-3 py-1 bg-gray-100 text-[#6b6b84] rounded-lg text-xs hover:bg-gray-200 transition"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-[#2d2d3f] text-sm">
                    {comment.content || comment.text}
                  </p>
                  <div className="flex flex-wrap items-center gap-3 mt-1">
                    <button
                      onClick={() => handleLikeComment(comment._id || comment.id)}
                      className="text-xs text-[#6b6b84] hover:text-indigo-600 transition flex items-center gap-1"
                    >
                      <i
                        className={`${comment.isLiked ? 'fas' : 'far'} fa-heart`}
                      ></i>
                      {comment.likes > 0 && <span>{comment.likes}</span>}
                    </button>
                    <button
                      onClick={() =>
                        setReplyTo(
                          replyTo === (comment._id || comment.id)
                            ? null
                            : comment._id || comment.id
                        )
                      }
                      className="text-xs text-[#6b6b84] hover:text-indigo-600 transition"
                    >
                      <i className="far fa-reply mr-1"></i> Reply
                    </button>
                    {user && user.id === comment.author?._id && (
                      <>
                        <button
                          onClick={() => {
                            setEditingId(comment._id || comment.id);
                            setEditText(comment.content || comment.text);
                          }}
                          className="text-xs text-[#6b6b84] hover:text-indigo-600 transition"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(comment._id || comment.id)}
                          className="text-xs text-[#6b6b84] hover:text-red-600 transition"
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </>
              )}

              {/* Reply Form */}
              {replyTo === (comment._id || comment.id) && (
                <div className="mt-3 ml-4">
                  <textarea
                    value={replyText}
                    onChange={e => setReplyText(e.target.value)}
                    placeholder="Write a reply..."
                    className="w-full px-3 py-2 rounded-lg border border-[#e6e6ed] focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-sm"
                    rows="2"
                  />
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => handleReply(comment._id || comment.id)}
                      className="px-3 py-1 bg-indigo-600 text-white rounded-lg text-xs hover:bg-indigo-700 transition"
                    >
                      Reply
                    </button>
                    <button
                      onClick={() => {
                        setReplyTo(null);
                        setReplyText('');
                      }}
                      className="px-3 py-1 bg-gray-100 text-[#6b6b84] rounded-lg text-xs hover:bg-gray-200 transition"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Replies */}
              {comment.replies && comment.replies.length > 0 && (
                <div className="ml-8 mt-4 space-y-4 border-l-2 border-[#f0eef8] pl-4">
                  {comment.replies.map(reply => (
                    <div key={reply._id || reply.id} className="flex gap-3">
                      <img
                        src={
                          reply.author?.avatar ||
                          reply.avatar ||
                          `https://ui-avatars.com/api/?name=${(
                            reply.author?.name || reply.name || 'User'
                          ).replace(' ', '+')}`
                        }
                        alt={reply.author?.name || reply.name || 'User'}
                        className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm text-[#1e1e2a]">
                            {reply.author?.name || reply.name || 'Anonymous'}
                          </span>
                          <span className="text-xs text-[#6b6b84]">
                            {formatDate(reply.createdAt || reply.date)}
                          </span>
                        </div>
                        <p className="text-sm text-[#2d2d3f]">
                          {reply.content || reply.text}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))
      )}

      {/* Add Comment */}
      {user ? (
        <div className="mt-8 pt-6 border-t border-[#f0eef8]">
          <h4 className="font-semibold text-[#1e1e2a] mb-3">Leave a comment</h4>
          <form onSubmit={handleSubmit}>
            <textarea
              name="text"
              placeholder="Write your comment..."
              rows="4"
              value={newComment}
              onChange={e => setNewComment(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-[#e6e6ed] bg-[#faf9f6] focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-sm"
              required
              disabled={isSubmitting}
            />
            <button
              type="submit"
              disabled={isSubmitting || !newComment.trim()}
              className="mt-3 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-medium transition text-sm disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Posting...
                </>
              ) : (
                <>
                  <i className="fas fa-paper-plane"></i> Post Comment
                </>
              )}
            </button>
          </form>
        </div>
      ) : (
        <div className="mt-8 pt-6 border-t border-[#f0eef8] bg-[#faf9f6] rounded-2xl p-6 text-center">
          <p className="text-sm text-[#6b6b84]">
            <a href="/login" className="text-indigo-600 hover:text-indigo-800 font-medium">
              Login
            </a>{' '}
            to join the conversation
          </p>
        </div>
      )}
    </section>
  );
};

export default CommentsSection;