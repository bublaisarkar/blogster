// pages/CategoryPage.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import axios from '../api/axios';

const CategoryPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [category, setCategory] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategoryData = async () => {
      try {
        setLoading(true);
        setError(null);

        // ✅ Fetch category by slug
        const categoryResponse = await axios.get(`/categories/slug/${slug}`);
        if (!categoryResponse.data.success) {
          throw new Error('Category not found');
        }
        const categoryData = categoryResponse.data.data;
        setCategory(categoryData);

        // ✅ Fetch posts for this category
        const postsResponse = await axios.get('/blogs', {
          params: {
            category: slug,
            status: 'published',
            limit: 20
          }
        });
        
        if (postsResponse.data.success) {
          setPosts(postsResponse.data.data || []);
        }
      } catch (error) {
        console.error('Error fetching category:', error);
        setError(error.response?.data?.message || 'Failed to load category');
        
        if (error.response?.status === 404) {
          toast.error('Category not found');
          navigate('/404', { replace: true });
        } else {
          toast.error('Failed to load category');
        }
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchCategoryData();
    }
  }, [slug, navigate]);

  // ✅ Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return 'Recent';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // ✅ Calculate read time
  const calculateReadTime = (content) => {
    if (!content) return '1 min read';
    const wordsPerMinute = 200;
    const words = content.replace(/<[^>]*>/g, '').split(/\s+/).length;
    const minutes = Math.ceil(words / wordsPerMinute);
    return `${minutes} min read`;
  };

  // ✅ Loading state
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-10 w-48 bg-gray-200 rounded mb-4"></div>
          <div className="h-4 w-64 bg-gray-200 rounded mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((item) => (
              <div key={item} className="bg-white rounded-2xl border border-[#edebf5] overflow-hidden">
                <div className="h-48 bg-gray-200"></div>
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ✅ Error state
  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl border border-[#edebf5] p-12 text-center">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-2xl font-bold text-[#14141f] mb-2">Category Not Found</h2>
          <p className="text-[#6b6b84] mb-6">{error}</p>
          <button 
            onClick={() => navigate('/articles')}
            className="px-6 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition"
          >
            Back to Articles
          </button>
        </div>
      </div>
    );
  }

  // ✅ No category
  if (!category) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl border border-[#edebf5] p-12 text-center">
          <div className="text-6xl mb-4">📂</div>
          <h2 className="text-2xl font-bold text-[#14141f] mb-2">Category Not Found</h2>
          <p className="text-[#6b6b84] mb-6">The category you're looking for doesn't exist.</p>
          <button 
            onClick={() => navigate('/articles')}
            className="px-6 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition"
          >
            Back to Articles
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Category Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <span 
            className="w-4 h-4 rounded-full"
            style={{ backgroundColor: category.color || '#6366f1' }}
          />
          <h1 className="text-3xl sm:text-4xl font-bold text-[#14141f]">
            {category.name}
          </h1>
        </div>
        {category.description && (
          <p className="text-[#6b6b84] text-lg">{category.description}</p>
        )}
        <p className="text-[#6b6b84] text-sm mt-2">
          {posts.length} {posts.length === 1 ? 'article' : 'articles'} in this category
        </p>
      </div>

      {/* Posts Grid */}
      {posts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <Link 
              key={post._id} 
              to={`/blog/${post.slug}`}
              className="group bg-white rounded-2xl border border-[#edebf5] overflow-hidden hover:shadow-lg transition-shadow"
            >
              {/* Thumbnail */}
              {post.thumbnail && (
                <div className="w-full h-48 overflow-hidden">
                  <img 
                    src={post.thumbnail} 
                    alt={post.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              )}
              
              <div className="p-4">
                {/* Category Tag */}
                {post.categories && post.categories.length > 0 && (
                  <span 
                    className="inline-block text-xs font-medium px-2.5 py-0.5 rounded-full mb-2"
                    style={{ 
                      backgroundColor: `${post.categories[0].color || '#6366f1'}20`,
                      color: post.categories[0].color || '#6366f1'
                    }}
                  >
                    {post.categories[0].name}
                  </span>
                )}
                
                <h3 className="text-lg font-bold text-[#14141f] group-hover:text-indigo-600 transition line-clamp-2">
                  {post.title}
                </h3>
                
                <p className="text-sm text-[#6b6b84] mt-1 line-clamp-2">
                  {post.excerpt || post.content?.substring(0, 120) || ''}
                </p>
                
                <div className="flex items-center gap-3 mt-3 text-xs text-[#6b6b84]">
                  <span>{formatDate(post.createdAt)}</span>
                  <span>•</span>
                  <span>{calculateReadTime(post.content)}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#edebf5] p-12 text-center">
          <div className="text-6xl mb-4">📝</div>
          <h3 className="text-xl font-semibold text-[#14141f] mb-2">No Articles Yet</h3>
          <p className="text-[#6b6b84]">
            There are no articles in this category yet. Check back later!
          </p>
        </div>
      )}
    </div>
  );
};

export default CategoryPage;