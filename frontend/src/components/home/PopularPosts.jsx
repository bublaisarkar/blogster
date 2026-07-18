import { useState, useEffect } from 'react';
import axios from '../../api/axios';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

// ✅ Get rank badge color (outside component)
const getRankColor = (rank) => {
  switch(rank) {
    case '#1': return 'bg-yellow-100 text-yellow-700';
    case '#2': return 'bg-gray-100 text-gray-700';
    case '#3': return 'bg-amber-100 text-amber-700';
    default: return 'bg-indigo-50 text-indigo-600';
  }
};

const PopularPosts = () => {
  const [popularPosts, setPopularPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ✅ Fetch popular posts - no demo fallback
  useEffect(() => {
    const fetchPopularPosts = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data } = await axios.get('/blogs/popular', {
          params: {
            limit: 5,
            days: 30,
            sortBy: 'commentCount',
            sortOrder: 'desc'
          }
        });

        if (data.success && data.data.length > 0) {
          // ✅ Transform and filter posts with images
          const formattedPosts = data.data
            .map((post, index) => ({
              id: post._id || post.id,
              image: post.coverImage || post.thumbnail,
              alt: post.title || 'Blog post',
              title: post.title || 'Untitled Post',
              comments: post.commentCount || post.comments?.length || 0,
              rank: `#${index + 1}`,
              slug: post.slug || post._id,
              views: post.views || 0,
              likes: post.likes || 0
            }))
            .filter(post => post.image); // ✅ Only keep posts with images

          if (formattedPosts.length > 0) {
            setPopularPosts(formattedPosts);
          } else {
            setError('No popular posts with images available');
            setPopularPosts([]);
          }
        } else {
          setError('No popular posts found');
          setPopularPosts([]);
        }
      } catch {
        // ✅ Removed unused 'err' parameter
        console.error('Error fetching popular posts');
        setError('Failed to load popular posts');
        setPopularPosts([]);
        toast.error('Could not load popular posts');
      } finally {
        setLoading(false);
      }
    };

    fetchPopularPosts();
  }, []); // ✅ Empty dependency array - run once on mount

  // Loading state
  if (loading) {
    return (
      <div className="mt-5 sm:mt-6">
        <h3 className="text-lg sm:text-xl font-semibold flex items-center gap-2">
          <i className="fas fa-fire text-orange-500" aria-hidden="true"></i> Popular This Month
        </h3>
        <div className="mt-3 space-y-2 sm:space-y-3">
          {[1, 2, 3, 4].map((item) => (
            <div 
              key={item}
              className="flex items-center gap-2 sm:gap-3 bg-white p-2 sm:p-3 rounded-xl border border-[#efedf7] animate-pulse"
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-200 rounded-lg flex-shrink-0"></div>
              <div className="flex-1 min-w-0 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/3"></div>
              </div>
              <div className="h-5 w-8 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error && popularPosts.length === 0) {
    return (
      <div className="mt-5 sm:mt-6">
        <h3 className="text-lg sm:text-xl font-semibold flex items-center gap-2">
          <i className="fas fa-fire text-orange-500" aria-hidden="true"></i> Popular This Month
        </h3>
        <div className="mt-3 bg-white p-4 rounded-xl border border-[#efedf7] text-center">
          <i className="fas fa-exclamation-circle text-red-400 text-2xl mb-2" aria-hidden="true"></i>
          <p className="text-sm text-[#6b6b84]">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-2 text-xs text-indigo-600 hover:text-indigo-800"
            type="button"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-5 sm:mt-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg sm:text-xl font-semibold flex items-center gap-2">
          <i className="fas fa-fire text-orange-500" aria-hidden="true"></i> Popular This Month
        </h3>
        <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">
          Top {popularPosts.length}
        </span>
      </div>
      
      <div className="mt-3 space-y-2 sm:space-y-3">
        {popularPosts.map((post) => (
          <Link
            key={post.id}
            to={`/blog/${post.slug}`}
            className="flex items-center gap-2 sm:gap-3 bg-white p-2 sm:p-3 rounded-xl border border-[#efedf7] hover:shadow-md hover:border-orange-200 transition-all duration-300 group"
          >
            <img 
              src={post.image} 
              alt={post.alt} 
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg object-cover flex-shrink-0 group-hover:scale-105 transition-transform duration-300" 
              loading="lazy"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-medium truncate group-hover:text-orange-600 transition-colors">
                {post.title}
              </p>
              <div className="flex items-center gap-2 text-xs text-[#7f7b99]">
                <span>
                  <i className="far fa-comment mr-1" aria-hidden="true"></i>{post.comments} comments
                </span>
                {post.views > 0 && (
                  <>
                    <span>·</span>
                    <span>
                      <i className="far fa-eye mr-1" aria-hidden="true"></i>{post.views} views
                    </span>
                  </>
                )}
                {post.likes > 0 && (
                  <>
                    <span>·</span>
                    <span>
                      <i className="far fa-heart mr-1" aria-hidden="true"></i>{post.likes}
                    </span>
                  </>
                )}
              </div>
            </div>
            <span className={`font-bold text-xs sm:text-sm px-2 py-1 rounded-full ${getRankColor(post.rank)}`}>
              {post.rank}
            </span>
          </Link>
        ))}
      </div>

      {/* View all link */}
      {popularPosts.length > 0 && (
        <Link 
          to="/articles?sort=popular" 
          className="block text-center text-xs text-indigo-600 hover:text-indigo-800 font-medium mt-3"
        >
          View all popular posts <i className="fas fa-arrow-right ml-1" aria-hidden="true"></i>
        </Link>
      )}
    </div>
  );
};

export default PopularPosts;