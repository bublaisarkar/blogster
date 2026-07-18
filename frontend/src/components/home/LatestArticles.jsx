import { useState, useEffect } from 'react';
import axios from '../../api/axios';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

// ✅ Helper functions (moved outside component)
const formatDate = (dateString) => {
  if (!dateString) return 'Recent';
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now - date);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
};

const LatestArticles = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalPosts: 0,
    limit: 4
  });

  // ✅ Fetch latest posts - defined inside useEffect
  useEffect(() => {
    const fetchLatestPosts = async (page = 1) => {
      try {
        setLoading(true);
        setError(null);

        const { data } = await axios.get('/blogs', {
          params: {
            status: 'published',
            page: page,
            limit: pagination.limit,
            sortBy: 'createdAt',
            sortOrder: 'desc'
          }
        });

        if (data.success && data.data.length > 0) {
          const formattedArticles = data.data.map((post) => ({
            id: post._id || post.id,
            image: post.coverImage || post.thumbnail,
            alt: post.title || 'Blog post',
            title: post.title || 'Untitled Post',
            date: formatDate(post.createdAt || post.publishedAt),
            readTime: `${Math.ceil((post.content?.length || 0) / 1000)} min read`,
            description: post.excerpt || post.content?.substring(0, 120) || 'No description available',
            slug: post.slug || post._id,
            author: post.author?.name || 'Anonymous',
            category: post.category || post.categories?.[0]?.name || 'General'
          }));

          // ✅ Filter out articles without images
          const articlesWithImages = formattedArticles.filter(article => article.image);
          
          if (articlesWithImages.length > 0) {
            setArticles(articlesWithImages);
          } else {
            setError('No articles with images available');
            setArticles([]);
          }

          setPagination({
            currentPage: data.pagination?.page || page,
            totalPages: data.pagination?.totalPages || Math.ceil((data.pagination?.total || 0) / pagination.limit) || 1,
            totalPosts: data.pagination?.total || data.data.length,
            limit: pagination.limit
          });
        } else {
          setError('No articles found');
          setArticles([]);
        }
      } catch {
        // ✅ Removed unused 'err' parameter
        setError('Failed to load latest articles');
        setArticles([]);
        toast.error('Could not load latest articles');
      } finally {
        setLoading(false);
      }
    };

    // ✅ Call the function inside the effect
    fetchLatestPosts(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // ✅ Empty dependency array - only runs on mount

  // ✅ Handle page change
  const handlePageChange = (page) => {
    if (page < 1 || page > pagination.totalPages) return;
    
    // ✅ Re-fetch with new page
    const fetchPage = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get('/blogs', {
          params: {
            status: 'published',
            page: page,
            limit: pagination.limit,
            sortBy: 'createdAt',
            sortOrder: 'desc'
          }
        });

        if (data.success && data.data.length > 0) {
          const formattedArticles = data.data.map((post) => ({
            id: post._id || post.id,
            image: post.coverImage || post.thumbnail,
            alt: post.title || 'Blog post',
            title: post.title || 'Untitled Post',
            date: formatDate(post.createdAt || post.publishedAt),
            readTime: `${Math.ceil((post.content?.length || 0) / 1000)} min read`,
            description: post.excerpt || post.content?.substring(0, 120) || 'No description available',
            slug: post.slug || post._id,
            author: post.author?.name || 'Anonymous',
            category: post.category || post.categories?.[0]?.name || 'General'
          }));

          const articlesWithImages = formattedArticles.filter(article => article.image);
          setArticles(articlesWithImages.length > 0 ? articlesWithImages : []);
          
          setPagination({
            currentPage: data.pagination?.page || page,
            totalPages: data.pagination?.totalPages || Math.ceil((data.pagination?.total || 0) / pagination.limit) || 1,
            totalPosts: data.pagination?.total || data.data.length,
            limit: pagination.limit
          });
          setError(null);
        }
      } catch {
        // ✅ Removed unused 'err' parameter
        toast.error('Failed to load articles');
      } finally {
        setLoading(false);
      }
    };
    fetchPage();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ✅ Loading state
  if (loading) {
    return (
      <div className="lg:col-span-2">
        <div className="flex items-center gap-2 sm:gap-3 mb-4">
          <i className="fas fa-newspaper text-indigo-600 text-xl sm:text-2xl"></i>
          <h2 className="text-xl sm:text-2xl font-semibold tracking-tight">Latest articles</h2>
        </div>
        <div className="space-y-4 sm:space-y-5">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-5 bg-white p-4 rounded-2xl border border-[#f0eefa] animate-pulse">
              <div className="w-full sm:w-40 md:w-48 h-28 sm:h-32 md:h-36 bg-gray-200 rounded-xl flex-shrink-0"></div>
              <div className="flex-1 space-y-2 w-full">
                <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ✅ Error state
  if (error && articles.length === 0) {
    return (
      <div className="lg:col-span-2">
        <div className="flex items-center gap-2 sm:gap-3 mb-4">
          <i className="fas fa-newspaper text-indigo-600 text-xl sm:text-2xl"></i>
          <h2 className="text-xl sm:text-2xl font-semibold tracking-tight">Latest articles</h2>
        </div>
        <div className="bg-white p-8 rounded-2xl border border-[#f0eefa] text-center">
          <i className="fas fa-exclamation-circle text-4xl text-red-400 mb-3"></i>
          <p className="text-[#6b6b84]">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-3 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="lg:col-span-2">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 sm:gap-3">
          <i className="fas fa-newspaper text-indigo-600 text-xl sm:text-2xl"></i>
          <h2 className="text-xl sm:text-2xl font-semibold tracking-tight">Latest articles</h2>
          <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">
            {pagination.totalPosts} posts
          </span>
        </div>
        {articles.length > 0 && (
          <Link 
            to="/blog" 
            className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
          >
            View All <i className="fas fa-arrow-right ml-1"></i>
          </Link>
        )}
      </div>

      <div className="space-y-4 sm:space-y-5">
        {articles.map((article) => (
          <Link
            key={article.id}
            to={`/blog/${article.slug}`}
            className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-5 bg-white p-4 rounded-2xl border border-[#f0eefa] hover:shadow-md transition-all duration-300 hover:border-indigo-200 group"
          >
            {article.image && (
              <img 
                src={article.image} 
                alt={article.alt} 
                className="w-full sm:w-40 md:w-48 h-28 sm:h-32 md:h-36 object-cover rounded-xl flex-shrink-0 group-hover:scale-105 transition-transform duration-300" 
                loading="lazy"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            )}
            <div className="flex-1 min-w-0">
              {article.category && (
                <span className="inline-block text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full mb-1">
                  {article.category}
                </span>
              )}
              <h4 className="font-semibold text-base sm:text-lg group-hover:text-indigo-600 transition-colors line-clamp-2">
                {article.title}
              </h4>
              <div className="text-xs text-[#6a6a82] mt-1 flex flex-wrap items-center gap-2">
                <span>
                  <i className="far fa-calendar-alt mr-1"></i> {article.date}
                </span>
                <span>·</span>
                <span>
                  <i className="far fa-clock mr-1"></i> {article.readTime}
                </span>
                {article.author && (
                  <>
                    <span>·</span>
                    <span>
                      <i className="far fa-user mr-1"></i> {article.author}
                    </span>
                  </>
                )}
              </div>
              <p className="text-sm text-[#5a5a72] mt-1 hidden sm:block line-clamp-2">
                {article.description}
              </p>
            </div>
          </Link>
        ))}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-1 sm:gap-2 mt-6">
          <button
            onClick={() => handlePageChange(pagination.currentPage - 1)}
            disabled={pagination.currentPage === 1}
            className={`px-2 sm:px-3 py-1 rounded-lg border border-[#e6e6ed] bg-white text-sm font-medium text-[#4a4a5e] transition ${
              pagination.currentPage === 1 
                ? 'opacity-50 cursor-not-allowed' 
                : 'hover:bg-[#f0eff5]'
            }`}
            aria-label="Previous page"
          >
            <i className="fas fa-chevron-left"></i>
          </button>

          {Array.from({ length: Math.min(pagination.totalPages, 7) }, (_, i) => {
            let pageNum;
            const total = pagination.totalPages;
            const current = pagination.currentPage;

            if (total <= 7) {
              pageNum = i + 1;
            } else if (current <= 4) {
              pageNum = i + 1;
              if (i === 6) pageNum = total;
            } else if (current >= total - 3) {
              pageNum = total - 6 + i;
            } else {
              pageNum = current - 3 + i;
            }

            if (i === 0 && pageNum > 1) {
              return (
                <button
                  key="ellipsis-start"
                  className="px-2 sm:px-3 py-1 text-sm text-[#4a4a5e]"
                  disabled
                >
                  ...
                </button>
              );
            }

            if (i === 6 && pageNum < total - 1) {
              return (
                <button
                  key="ellipsis-end"
                  className="px-2 sm:px-3 py-1 text-sm text-[#4a4a5e]"
                  disabled
                >
                  ...
                </button>
              );
            }

            return (
              <button
                key={pageNum}
                onClick={() => handlePageChange(pageNum)}
                className={`px-3 sm:px-4 py-1 rounded-lg text-sm font-medium transition ${
                  pagination.currentPage === pageNum
                    ? 'bg-indigo-600 text-white'
                    : 'border border-[#e6e6ed] bg-white text-[#4a4a5e] hover:bg-[#f0eff5]'
                }`}
              >
                {pageNum}
              </button>
            );
          })}

          <button
            onClick={() => handlePageChange(pagination.currentPage + 1)}
            disabled={pagination.currentPage === pagination.totalPages}
            className={`px-2 sm:px-3 py-1 rounded-lg border border-[#e6e6ed] bg-white text-sm font-medium text-[#4a4a5e] transition ${
              pagination.currentPage === pagination.totalPages 
                ? 'opacity-50 cursor-not-allowed' 
                : 'hover:bg-[#f0eff5]'
            }`}
            aria-label="Next page"
          >
            <i className="fas fa-chevron-right"></i>
          </button>
        </div>
      )}
    </div>
  );
};

export default LatestArticles;