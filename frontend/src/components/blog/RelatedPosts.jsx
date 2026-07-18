import { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import axios from '../../api/axios';

const RelatedPosts = ({ 
  posts: initialPosts = [], 
  postId, 
  category, 
  limit = 3,
  onPostClick 
}) => {
  const [posts, setPosts] = useState(initialPosts);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const hasFetched = useRef(false);

  // ✅ Fetch related posts with useCallback
  const fetchRelatedPosts = useCallback(async () => {
    if (!postId) return;
    
    try {
      setLoading(true);
      setError(null);

      const { data } = await axios.get('/blogs/related', {
        params: {
          postId,
          category,
          limit,
          excludeCurrent: true
        }
      });

      if (data.success) {
        setPosts(data.data);
      } else {
        setError('Failed to load related posts');
      }
    } catch (error) {
      console.error('Failed to fetch related posts:', error);
      setError('Could not load related posts');
    } finally {
      setLoading(false);
    }
  }, [postId, category, limit]);

  // ✅ useEffect without any setState warnings
  useEffect(() => {
    // If initialPosts are provided and we haven't fetched yet
    if (initialPosts.length > 0 && !hasFetched.current) {
      setPosts(initialPosts);
      setLoading(false);
      hasFetched.current = true;
      return;
    }

    // Only fetch if we have postId and haven't fetched yet
    if (postId && !hasFetched.current) {
      hasFetched.current = true;
      fetchRelatedPosts();
    }
  }, [postId, initialPosts, fetchRelatedPosts]);

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'Recent';
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Calculate read time
  const calculateReadTime = (content) => {
    if (!content) return '3 min read';
    const wordsPerMinute = 200;
    const words = content.replace(/<[^>]*>/g, '').split(/\s+/).length;
    const minutes = Math.max(1, Math.ceil(words / wordsPerMinute));
    return `${minutes} min read`;
  };

  // ✅ Format post data – removed fallback image URL
  const formatPosts = (postsData) => {
    return postsData.map(post => ({
      id: post._id || post.id,
      title: post.title,
      slug: post.slug || post._id,
      category: post.category || post.tags?.[0] || 'General',
      image: post.coverImage || post.image, // ✅ No fallback
      date: formatDate(post.createdAt || post.publishedAt),
      readTime: calculateReadTime(post.content),
      excerpt: post.excerpt || post.content?.substring(0, 120) || 'No description available',
      author: post.author?.name || 'Anonymous',
      views: post.views || 0,
      commentCount: post.commentCount || post.comments?.length || 0
    }));
  };

  const formattedPosts = formatPosts(posts);

  // Loading state
  if (loading) {
    return (
      <section className="mt-12 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-[#14141f] flex items-center gap-3">
            <i className="fas fa-link text-indigo-600"></i> Related Posts
          </h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {[1, 2, 3].map((item) => (
            <div key={item} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-[#efedf5] animate-pulse">
              <div className="w-full h-44 bg-gray-200"></div>
              <div className="p-4 sm:p-5 space-y-3">
                <div className="h-6 w-20 bg-gray-200 rounded-full"></div>
                <div className="h-5 w-3/4 bg-gray-200 rounded"></div>
                <div className="h-4 w-full bg-gray-200 rounded"></div>
                <div className="flex gap-3">
                  <div className="h-3 w-16 bg-gray-200 rounded"></div>
                  <div className="h-3 w-16 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  // Error state
  if (error && !posts.length) {
    return (
      <section className="mt-12 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-[#14141f] flex items-center gap-3">
            <i className="fas fa-link text-indigo-600"></i> Related Posts
          </h3>
        </div>
        <div className="bg-[#faf9f6] rounded-2xl p-8 text-center border border-[#efedf5]">
          <i className="fas fa-exclamation-circle text-3xl text-gray-400 mb-3"></i>
          <p className="text-[#6b6b84]">No related posts found</p>
          <button 
            onClick={() => {
              hasFetched.current = false;
              fetchRelatedPosts();
            }}
            className="mt-3 text-sm text-indigo-600 hover:text-indigo-800 transition"
          >
            <i className="fas fa-sync mr-1"></i> Retry
          </button>
        </div>
      </section>
    );
  }

  // No posts state
  if (!formattedPosts.length) {
    return null;
  }

  return (
    <section className="mt-12 mb-8">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold text-[#14141f] flex items-center gap-3">
          <i className="fas fa-link text-indigo-600"></i> 
          Related Posts
          <span className="text-sm font-normal text-[#6b6b84]">
            ({formattedPosts.length})
          </span>
        </h3>
        <Link 
          to="/blog" 
          className="text-sm text-indigo-600 hover:text-indigo-800 transition font-medium flex items-center gap-1"
        >
          View all <i className="fas fa-arrow-right"></i>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {formattedPosts.map((post) => (
          <Link 
            key={post.id} 
            to={`/blog/${post.slug}`}  
            onClick={() => onPostClick && onPostClick(post)}
            className="bg-white rounded-2xl overflow-hidden shadow-sm border border-[#efedf5] hover:shadow-lg transition-all duration-300 group hover:border-indigo-200"
          >
            {/* ✅ Conditionally render image only if it exists */}
            {post.image && (
              <div className="relative overflow-hidden">
                <img 
                  src={post.image} 
                  alt={post.title} 
                  className="w-full h-44 object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                {post.views > 100 && (
                  <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full">
                    <i className="fas fa-fire text-orange-400 mr-1"></i> 
                    {post.views > 1000 ? `${(post.views/1000).toFixed(1)}k` : post.views}
                  </div>
                )}
              </div>
            )}
            <div className="p-4 sm:p-5">
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-block bg-[#eae9f2] text-[#33334a] text-xs font-semibold uppercase px-3 py-1 rounded-full">
                  {post.category}
                </span>
                {post.commentCount > 0 && (
                  <span className="text-xs text-[#6b6b84]">
                    <i className="far fa-comment mr-1"></i> {post.commentCount}
                  </span>
                )}
              </div>
              <h4 className="font-semibold text-[#1e1e2a] group-hover:text-indigo-600 transition line-clamp-2">
                {post.title}
              </h4>
              <p className="text-sm text-[#6b6b84] mt-1 line-clamp-2">
                {post.excerpt}
              </p>
              <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-[#6b6b84]">
                <span>
                  <i className="far fa-calendar-alt mr-1"></i> {post.date}
                </span>
                <span>
                  <i className="far fa-clock mr-1"></i> {post.readTime}
                </span>
                <span>
                  <i className="far fa-user mr-1"></i> {post.author}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* View all related posts button */}
      {formattedPosts.length === limit && category && (
        <div className="text-center mt-6">
          <Link 
            to={`/blog?category=${category}`}
            className="text-sm text-indigo-600 hover:text-indigo-800 font-medium transition"
          >
            View all posts in {category} <i className="fas fa-arrow-right ml-1"></i>
          </Link>
        </div>
      )}
    </section>
  );
};

export default RelatedPosts;