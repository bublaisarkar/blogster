import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import axios from '../api/axios';
import Breadcrumb from '../components/blog/Breadcrumb';
import BlogPost from '../components/blog/BlogPost';
import RelatedPosts from '../components/blog/RelatedPosts';

const BlogDetailPage = () => {
  // ✅ Alias the route param to 'slug' – works with both /blog/:slug and /blog/:id
  const { id: slug } = useParams();
  const navigate = useNavigate();
  
  const [postData, setPostData] = useState(null);
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch post data by slug
  useEffect(() => {
    const fetchPostData = async () => {
      try {
        setLoading(true);
        setError(null);

        // ✅ Fetch the main post using /blogs/slug/:slug
        const postResponse = await axios.get(`/blogs/slug/${slug}`);
        
        if (!postResponse.data.success) {
          throw new Error(postResponse.data.message || 'Post not found');
        }

        const post = postResponse.data.data;
        setPostData(post);

        // ✅ Fetch related posts using /blogs/related
        try {
          const relatedResponse = await axios.get('/blogs/related', {
            params: {
              postId: post._id || post.id,
              category: post.category,
              limit: 3
            }
          });
          
          if (relatedResponse.data.success) {
            setRelatedPosts(relatedResponse.data.data);
          }
        } catch (relatedError) {
          console.error('Failed to fetch related posts:', relatedError);
        }

        // ✅ Increment view count using /blogs/:id/view
        try {
          await axios.put(`/blogs/${post._id || post.id}/view`);
        } catch (viewError) {
          console.error('Failed to increment view count:', viewError);
        }

      } catch (error) {
        console.error('Error fetching post:', error);
        setError(error.response?.data?.message || 'Failed to load post');
        
        if (error.response?.status === 404) {
          toast.error('Post not found');
          navigate('/404', { replace: true });
        } else {
          toast.error('Failed to load post');
        }
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchPostData();
    }
  }, [slug, navigate]);

  // Format post data for the BlogPost component
  const formatPostData = (post) => {
    if (!post) return null;

    return {
      id: post._id || post.id,
      title: post.title,
      category: post.category || post.tags?.[0] || 'General',
      date: formatDate(post.createdAt || post.publishedAt),
      readTime: calculateReadTime(post.content),
      coverImage: post.coverImage || post.image,
      author: {
        name: post.author?.name || 'Anonymous',
        title: post.author?.title || post.author?.bio || 'Writer',
        avatar: post.author?.avatar || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(post.author?.name || 'User')
      },
      content: post.content || post.body || '',
      excerpt: post.excerpt || post.content?.substring(0, 200) || '',
      tags: post.tags || [post.category].filter(Boolean),
      comments: post.comments || [],
      commentCount: post.commentCount || post.comments?.length || 0,
      views: post.views || 0,
      likes: post.likes || 0,
      slug: post.slug,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      allowComments: post.allowComments !== false // ✅ Include the allowComments flag
    };
  };

  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return 'Recent';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // Calculate read time helper
  const calculateReadTime = (content) => {
    if (!content) return '1 min read';
    const wordsPerMinute = 200;
    const words = content.replace(/<[^>]*>/g, '').split(/\s+/).length;
    const minutes = Math.ceil(words / wordsPerMinute);
    return `${minutes} min read`;
  };

  // Format related posts – removed fallback image
  const formatRelatedPosts = (posts) => {
    return posts.map(post => ({
      id: post._id || post.id,
      title: post.title,
      category: post.category || post.tags?.[0] || 'General',
      image: post.coverImage || post.image,
      date: formatDate(post.createdAt || post.publishedAt),
      readTime: calculateReadTime(post.content),
      excerpt: post.excerpt || post.content?.substring(0, 120) || '',
      slug: post.slug
    }));
  };

  // ✅ Handle like (using /blogs/:id/like)
  const handleLike = async () => {
    if (!postData) return;
    try {
      const response = await axios.put(`/blogs/${postData._id || postData.id}/like`);
      if (response.data.success) {
        setPostData(prev => ({
          ...prev,
          likes: (prev.likes || 0) + 1
        }));
      }
    } catch (error) {
      console.error('Failed to like post:', error);
      toast.error('Failed to like post');
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-6"></div>
        <div className="bg-white rounded-2xl border border-[#edebf5] shadow-sm overflow-hidden animate-pulse">
          <div className="w-full h-80 bg-gray-200"></div>
          <div className="p-6 space-y-4">
            <div className="h-8 bg-gray-200 rounded w-3/4"></div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
              <div className="space-y-2 flex-1">
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                <div className="h-3 bg-gray-200 rounded w-1/4"></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          </div>
        </div>
        <div className="mt-12">
          <div className="h-6 w-48 bg-gray-200 rounded animate-pulse mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((item) => (
              <div key={item} className="bg-white rounded-2xl border border-[#edebf5] overflow-hidden animate-pulse">
                <div className="w-full h-48 bg-gray-200"></div>
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

  // Error state
  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl border border-[#edebf5] p-12 text-center">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-2xl font-bold text-[#14141f] mb-2">Post Not Found</h2>
          <p className="text-[#6b6b84] mb-6">{error}</p>
          <button 
            onClick={() => navigate('/blog')}
            className="px-6 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition"
          >
            Back to Blog
          </button>
        </div>
      </div>
    );
  }

  // No post data
  if (!postData) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl border border-[#edebf5] p-12 text-center">
          <div className="text-6xl mb-4">📝</div>
          <h2 className="text-2xl font-bold text-[#14141f] mb-2">No Post Found</h2>
          <p className="text-[#6b6b84] mb-6">The post you're looking for doesn't exist.</p>
          <button 
            onClick={() => navigate('/blog')}
            className="px-6 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition"
          >
            Back to Blog
          </button>
        </div>
      </div>
    );
  }

  const formattedPost = formatPostData(postData);
  const formattedRelatedPosts = formatRelatedPosts(relatedPosts);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <Breadcrumb title={postData.title} />
      
      <BlogPost 
        post={formattedPost}
        postId={postData._id || postData.id}
        onLike={handleLike}
        allowComments={postData.allowComments !== false} // ✅ Pass allowComments to BlogPost
      />
      
      {formattedRelatedPosts.length > 0 && (
        <RelatedPosts posts={formattedRelatedPosts} />
      )}
    </div>
  );
};

export default BlogDetailPage;