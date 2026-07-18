import { useState, useEffect, useRef } from 'react';
import axios from '../../api/axios';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

const FeaturedSlider = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [slidesPerView, setSlidesPerView] = useState(3);
  const [slideWidth, setSlideWidth] = useState(0);
  const [featuredPosts, setFeaturedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const trackRef = useRef(null);
  const containerRef = useRef(null);

  // Fetch weekly popular posts from backend
  useEffect(() => {
    const fetchWeeklyPopularPosts = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data } = await axios.get('/blogs/popular', {
          params: {
            limit: 10,
            days: 7,
            sortBy: 'views'
          }
        });

        if (data.success && data.data.length > 0) {
          // ✅ Transform and filter posts with images
          const formattedPosts = data.data
            .map((post) => ({
              id: post._id || post.id,
              image: post.coverImage || post.thumbnail,
              alt: post.title || 'Blog post',
              category: post.category || post.tags?.[0] || 'General',
              title: post.title || 'Untitled Post',
              description: post.excerpt || post.content?.substring(0, 120) || 'No description available',
              author: post.author?.name || 'Anonymous',
              likes: post.likes || post.likeCount || 0,
              slug: post.slug || post._id,
              views: post.views || 0,
              commentCount: post.commentCount || post.comments?.length || 0,
              createdAt: post.createdAt || post.publishedAt
            }))
            .filter(post => post.image); // ✅ Only keep posts with images

          // Sort by views (most popular first)
          formattedPosts.sort((a, b) => b.views - a.views);
          
          // Take top 6 posts for slider
          const topPosts = formattedPosts.slice(0, 6);
          
          if (topPosts.length > 0) {
            setFeaturedPosts(topPosts);
          } else {
            setError('No popular posts with images available');
            setFeaturedPosts([]);
          }
        } else {
          setError('No popular posts found');
          setFeaturedPosts([]);
        }
      } catch {
        // ✅ Removed unused 'err' parameter
        console.error('Error fetching weekly popular posts');
        setError('Failed to load popular posts');
        setFeaturedPosts([]);
        toast.error('Could not load weekly popular posts');
      } finally {
        setLoading(false);
      }
    };

    fetchWeeklyPopularPosts();
  }, []);

  const totalSlides = featuredPosts.length;

  // Update slides per view based on screen size
  useEffect(() => {
    const updateSlidesPerView = () => {
      if (window.innerWidth < 480) setSlidesPerView(1);
      else if (window.innerWidth < 768) setSlidesPerView(2);
      else setSlidesPerView(3);
    };

    updateSlidesPerView();
    window.addEventListener('resize', updateSlidesPerView);
    return () => window.removeEventListener('resize', updateSlidesPerView);
  }, []);

  // Calculate slide width whenever slidesPerView changes
  useEffect(() => {
    if (containerRef.current && featuredPosts.length > 0) {
      const containerWidth = containerRef.current.offsetWidth;
      const gap = slidesPerView === 1 ? 0 : slidesPerView === 2 ? 16 : 24;
      const newSlideWidth = (containerWidth - (gap * (slidesPerView - 1))) / slidesPerView;
      setSlideWidth(newSlideWidth);
    }
  }, [slidesPerView, featuredPosts]);

  // Update slide width on resize
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current && featuredPosts.length > 0) {
        const containerWidth = containerRef.current.offsetWidth;
        const gap = slidesPerView === 1 ? 0 : slidesPerView === 2 ? 16 : 24;
        const newSlideWidth = (containerWidth - (gap * (slidesPerView - 1))) / slidesPerView;
        setSlideWidth(newSlideWidth);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [slidesPerView, featuredPosts]);

  // Auto-slide effect
  useEffect(() => {
    if (featuredPosts.length === 0) return;
    
    const maxIndex = Math.max(0, totalSlides - slidesPerView);
    if (maxIndex === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        if (prev < maxIndex) return prev + 1;
        return 0;
      });
    }, 4000);
    
    return () => clearInterval(interval);
  }, [totalSlides, slidesPerView, featuredPosts]);

  const goToSlide = (index) => {
    const maxIndex = Math.max(0, totalSlides - slidesPerView);
    setCurrentIndex(Math.min(index, maxIndex));
  };

  const nextSlide = () => {
    const maxIndex = Math.max(0, totalSlides - slidesPerView);
    setCurrentIndex((prev) => {
      if (prev < maxIndex) return prev + 1;
      return 0;
    });
  };

  const prevSlide = () => {
    const maxIndex = Math.max(0, totalSlides - slidesPerView);
    setCurrentIndex((prev) => {
      if (prev > 0) return prev - 1;
      return maxIndex;
    });
  };

  // Calculate translation in pixels
  const getTranslateX = () => {
    const gap = slidesPerView === 1 ? 0 : slidesPerView === 2 ? 16 : 24;
    return -(currentIndex * (slideWidth + gap));
  };

  // Loading state
  if (loading) {
    return (
      <div className="mt-10 sm:mt-12 mb-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <i className="fas fa-star text-indigo-600 text-xl sm:text-2xl"></i>
            <h2 className="text-xl sm:text-2xl font-semibold tracking-tight">Weekly Popular</h2>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mt-4">
          {[1, 2, 3].map((item) => (
            <div key={item} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-[#efedf5] animate-pulse">
              <div className="w-full h-40 sm:h-48 md:h-52 bg-gray-200"></div>
              <div className="p-4 sm:p-5 space-y-3">
                <div className="h-6 w-20 bg-gray-200 rounded-full"></div>
                <div className="h-6 w-3/4 bg-gray-200 rounded"></div>
                <div className="h-4 w-full bg-gray-200 rounded"></div>
                <div className="h-4 w-2/3 bg-gray-200 rounded"></div>
                <div className="flex justify-between">
                  <div className="h-4 w-24 bg-gray-200 rounded"></div>
                  <div className="h-4 w-16 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error && featuredPosts.length === 0) {
    return (
      <div className="mt-10 sm:mt-12 mb-5">
        <div className="flex items-center gap-2 sm:gap-3 mb-4">
          <i className="fas fa-star text-indigo-600 text-xl sm:text-2xl"></i>
          <h2 className="text-xl sm:text-2xl font-semibold tracking-tight">Weekly Popular</h2>
        </div>
        <div className="bg-white rounded-2xl p-8 text-center border border-[#efedf5]">
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

  // No posts state
  if (featuredPosts.length === 0) {
    return (
      <div className="mt-10 sm:mt-12 mb-5">
        <div className="flex items-center gap-2 sm:gap-3 mb-4">
          <i className="fas fa-star text-indigo-600 text-xl sm:text-2xl"></i>
          <h2 className="text-xl sm:text-2xl font-semibold tracking-tight">Weekly Popular</h2>
        </div>
        <div className="bg-white rounded-2xl p-8 text-center border border-[#efedf5]">
          <i className="fas fa-fire text-4xl text-gray-300 mb-3"></i>
          <p className="text-[#6b6b84]">No popular posts this week</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-10 sm:mt-12 mb-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-3">
          <i className="fas fa-fire text-orange-500 text-xl sm:text-2xl"></i>
          <h2 className="text-xl sm:text-2xl font-semibold tracking-tight">
            Weekly Popular
          </h2>
          <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">
            This Week
          </span>
        </div>
        {featuredPosts.length > slidesPerView && (
          <div className="flex gap-1 sm:gap-2">
            <button 
              onClick={prevSlide}
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-[#e6e6ed] bg-white hover:bg-[#f0eff5] transition flex items-center justify-center text-xs sm:text-sm"
              aria-label="Previous slides"
            >
              <i className="fas fa-chevron-left"></i>
            </button>
            <button 
              onClick={nextSlide}
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-[#e6e6ed] bg-white hover:bg-[#f0eff5] transition flex items-center justify-center text-xs sm:text-sm"
              aria-label="Next slides"
            >
              <i className="fas fa-chevron-right"></i>
            </button>
          </div>
        )}
      </div>

      {/* Slider */}
      <div 
        ref={containerRef}
        className="relative mt-4 overflow-hidden"
      >
        <div 
          ref={trackRef}
          className="flex gap-4 sm:gap-6 transition-transform duration-500 ease-in-out"
          style={{ 
            transform: `translateX(${getTranslateX()}px)`,
          }}
        >
          {featuredPosts.map((post) => (
            <Link
              key={post.id}
              to={`/blog/${post.slug}`}
              className="flex-shrink-0 group"
              style={{ 
                width: slideWidth ? `${slideWidth}px` : 'auto',
              }}
            >
              <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-[#efedf5] hover:shadow-lg transition-all duration-300 flex flex-col h-full group-hover:border-indigo-200">
                <div className="relative overflow-hidden">
                  {/* ✅ Only render image if it exists */}
                  {post.image && (
                    <img 
                      src={post.image} 
                      alt={post.alt} 
                      className="w-full h-40 sm:h-48 md:h-52 object-cover transition-transform duration-500 group-hover:scale-105" 
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  )}
                  <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full">
                    <i className="fas fa-eye mr-1"></i> {post.views || 0}
                  </div>
                  {post.commentCount > 0 && (
                    <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full">
                      <i className="fas fa-comment mr-1"></i> {post.commentCount}
                    </div>
                  )}
                </div>
                <div className="p-4 sm:p-5 flex-1 flex flex-col">
                  <span className="inline-block bg-[#eae9f2] text-[#33334a] text-xs font-semibold uppercase px-3 py-1 rounded-full self-start">
                    {post.category}
                  </span>
                  <h3 className="text-lg sm:text-xl font-semibold mt-2 sm:mt-3 mb-1 sm:mb-2 group-hover:text-indigo-600 transition-colors line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-[#5a5a72] text-xs sm:text-sm flex-1 line-clamp-2">
                    {post.description}
                  </p>
                  <div className="flex justify-between items-center text-xs text-[#6b6b84] border-t border-[#f0eef8] pt-2 sm:pt-3 mt-2 sm:mt-3">
                    <span>
                      <i className="far fa-user mr-1"></i> {post.author}
                    </span>
                    <span>
                      <i className="far fa-heart mr-1"></i> {post.likes}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Dots */}
      {featuredPosts.length > slidesPerView && (
        <div className="flex justify-center gap-2 mt-4">
          {Array.from({ length: Math.max(0, totalSlides - slidesPerView + 1) }).map((_, idx) => (
            <button
              key={idx}
              className={`h-2 rounded-full transition-all duration-200 ${
                currentIndex === idx 
                  ? 'bg-indigo-600 w-7' 
                  : 'bg-[#d1d0db] hover:bg-indigo-400 w-2.5'
              }`}
              onClick={() => goToSlide(idx)}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default FeaturedSlider;