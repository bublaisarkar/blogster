import { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import axios from '../../api/axios';
import useAuth from '../../hooks/useAuth';
import BlogContent from './BlogContent';
import CommentsSection from './CommentsSection';

const BlogPost = ({ post, postId, onLike, allowComments = true }) => {
  const { user } = useAuth();
  const [likeDeltaByPost, setLikeDeltaByPost] = useState({});
  const [isLiked, setIsLiked] = useState(false);
  const hasCheckedLike = useRef(false);

  const likeDelta = postId ? (likeDeltaByPost[postId] ?? 0) : 0;
  const likes = (post?.likes ?? 0) + likeDelta;

  // ✅ Check like status (only once)
  useEffect(() => {
    const checkLikeStatus = async () => {
      if (!user || !postId || hasCheckedLike.current) return;
      try {
        const { data } = await axios.get(`/blogs/${postId}/like-status`);
        if (data.success) {
          setIsLiked(data.isLiked);
        }
      } catch (error) {
        console.error('Failed to check like status:', error);
      }
    };
    if (postId && user) {
      checkLikeStatus();
      hasCheckedLike.current = true;
    }
  }, [postId, user]);

  const handleLike = async () => {
    if (!user) {
      toast.error('Please login to like posts');
      return;
    }
    try {
      const { data } = await axios.put(`/blogs/${postId}/like`);
      if (data.success) {
        const delta = isLiked ? -1 : 1;
        setIsLiked(!isLiked);
        setLikeDeltaByPost(prev => ({
          ...prev,
          [postId]: (prev[postId] ?? 0) + delta,
        }));
        if (onLike) onLike(!isLiked);
      }
    } catch (error) {
      console.error('Failed to like post:', error);
      toast.error('Failed to like post');
    }
  };

  return (
    <article className="mt-6 bg-white rounded-3xl overflow-hidden shadow-sm border border-[#edebf5]">
      {/* ✅ Cover Image - only render if exists */}
      {post.coverImage && (
        <div className="w-full h-64 sm:h-80 md:h-96 lg:h-[450px] overflow-hidden">
          <img 
            src={post.coverImage} 
            alt={post.title} 
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
      )}

      <div className="p-5 sm:p-8 md:p-10 lg:p-12">
        {/* Category Badge */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <span className="inline-block bg-indigo-100 text-indigo-700 text-xs font-semibold uppercase px-4 py-1.5 rounded-full">
            <i className="fas fa-brain mr-1"></i> {post.category}
          </span>
          <span className="text-xs text-[#6b6b84]">
            <i className="far fa-calendar-alt mr-1"></i> {post.date}
          </span>
          <span className="text-xs text-[#6b6b84]">
            <i className="far fa-clock mr-1"></i> {post.readTime}
          </span>
          <span className="text-xs text-[#6b6b84]">
            <i className="far fa-eye mr-1"></i> {post.views || 0} views
          </span>
        </div>

        {/* Title */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight text-[#14141f] mb-4">
          {post.title}
        </h1>

        {/* Author Info */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 mb-6 border-b border-[#f0eef8]">
          <div className="flex items-center gap-4">
            <img 
              src={post.author.avatar} 
              alt={post.author.name} 
              className="w-12 h-12 rounded-full object-cover"
            />
            <div>
              <p className="font-semibold text-[#1e1e2a]">{post.author.name}</p>
              <p className="text-sm text-[#6b6b84]">{post.author.title}</p>
            </div>
          </div>
          
          <button
            onClick={handleLike}
            className={`flex items-center gap-2 px-4 py-2 rounded-full transition ${
              isLiked ? 'bg-red-50 text-red-500' : 'bg-gray-50 text-[#6b6b84] hover:bg-gray-100'
            }`}
          >
            <i className={`${isLiked ? 'fas' : 'far'} fa-heart`}></i>
            <span>{likes}</span>
          </button>
        </div>

        {/* Blog Content */}
        <BlogContent content={post.content} tags={post.tags} />

        {/* ✅ Comments Section - Conditionally rendered based on allowComments */}
        {allowComments !== false ? (
          <CommentsSection postId={postId} />
        ) : (
          <div className="mt-10 pt-6 border-t border-[#f0eef8]">
            <div className="p-8 bg-gray-50 rounded-2xl border border-gray-200 text-center">
              <i className="fas fa-comment-slash text-4xl text-gray-400 mb-3"></i>
              <p className="text-gray-500 font-medium">Comments are disabled for this post.</p>
            </div>
          </div>
        )}
      </div>
    </article>
  );
};

export default BlogPost;