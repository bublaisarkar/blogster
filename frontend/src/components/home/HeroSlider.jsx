import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import axios from '../../api/axios';
import { Link } from 'react-router-dom';

// ✅ Helper functions (moved outside component)
const getPopularityBadge = (index, total) => {
  if (index === 0) return 'Most Popular';
  if (index === 1) return 'Trending';
  if (index === 2) return 'Featured';
  if (index === total - 1) return 'New';
  return 'Popular';
};

const getBadgeColor = (index) => {
  const colors = [
    'bg-indigo-100 text-indigo-700',
    'bg-amber-100 text-amber-700',
    'bg-emerald-100 text-emerald-700',
    'bg-rose-100 text-rose-700',
    'bg-purple-100 text-purple-700'
  ];
  return colors[index % colors.length];
};

const getBadgeIcon = (index) => {
  const icons = ['fa-bolt', 'fa-rocket', 'fa-leaf', 'fa-star', 'fa-fire'];
  return icons[index % icons.length];
};

const formatDate = (dateString) => {
  if (!dateString) return 'Recent';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
};

const HeroSlider = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ✅ Fetch popular posts from backend
  useEffect(() => {
    const fetchPopularPosts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const { data } = await axios.get('/blogs/popular', {
          params: {
            limit: 5,
            days: 30
          }
        });

        if (data.success && data.data.length > 0) {
          // ✅ Transform API response to match slider format
          const formattedSlides = data.data.map((post, index) => ({
            id: post._id || post.id || index,
            badge: getPopularityBadge(index, data.data.length),
            badgeColor: getBadgeColor(index),
            badgeIcon: getBadgeIcon(index),
            title: post.title || 'Untitled Post',
            description: post.excerpt || post.content?.substring(0, 150) || 'No description available',
            date: formatDate(post.createdAt || post.publishedAt),
            readTime: `${Math.ceil((post.content?.length || 0) / 1000)} min read`,
            comments: `${post.commentCount || post.comments?.length || 0} comments`,
            image: post.coverImage || post.thumbnail,
            alt: post.title || 'Blog post',
            slug: post.slug || post._id,
            author: post.author?.name || 'Anonymous'
          }));
          
          // ✅ Filter out slides without images
          const slidesWithImages = formattedSlides.filter(slide => slide.image);
          
          if (slidesWithImages.length > 0) {
            setSlides(slidesWithImages);
          } else {
            setError('No posts with images available');
            setSlides([]);
          }
        } else {
          setError('No popular posts found');
          setSlides([]);
        }
      } catch (err) {
        console.error('Error fetching popular posts:', err);
        setError('Failed to load popular posts');
        setSlides([]);
        toast.error('Could not load popular posts');
      } finally {
        setLoading(false);
      }
    };

    fetchPopularPosts();
  }, []);

  // ✅ Auto-slide effect
  useEffect(() => {
    if (slides.length === 0) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [slides.length]);

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  const nextSlide = () => {
    if (slides.length === 0) return;
    setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length);
  };

  const prevSlide = () => {
    if (slides.length === 0) return;
    setCurrentIndex((prevIndex) => (prevIndex - 1 + slides.length) % slides.length);
  };

  // ✅ Loading state
  if (loading) {
    return (
      <div className="relative mt-6 rounded-3xl overflow-hidden bg-white shadow-lg">
        <div className="flex items-center justify-center h-64 md:h-80">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-[#6b6b84]">Loading popular posts...</p>
          </div>
        </div>
      </div>
    );
  }

  // ✅ Error or no slides state
  if (error || slides.length === 0) {
    return (
      <div className="relative mt-6 rounded-3xl overflow-hidden bg-white shadow-lg">
        <div className="flex items-center justify-center h-64 md:h-80">
          <div className="text-center">
            <i className="fas fa-newspaper text-4xl text-[#6b6b84] mb-3"></i>
            <p className="text-[#6b6b84]">{error || 'No posts available'}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative mt-6 rounded-3xl overflow-hidden bg-white shadow-lg">
      <div className="relative flex overflow-hidden rounded-3xl">
        <div 
          className="slider-track flex w-full transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {slides.map((slide) => (
            <Link 
              key={slide.id}
              to={`/blog/${slide.slug}`}
              className="min-w-full flex flex-col md:flex-row items-center bg-white hover:opacity-95 transition-opacity"
            >
              <div className="flex-1 p-5 sm:p-6 md:p-10 lg:p-12 space-y-3 order-2 md:order-1">
                <span className={`inline-block ${slide.badgeColor} text-xs font-semibold px-4 py-1 rounded-full`}>
                  <i className={`fas ${slide.badgeIcon} mr-1`}></i> {slide.badge}
                </span>
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-tight text-[#14141f]">
                  {slide.title}
                </h1>
                <p className="text-[#4a4a5e] text-sm sm:text-base max-w-lg">
                  {slide.description}
                </p>
                {slide.author && (
                  <p className="text-xs text-[#5f5f78]">
                    <i className="fas fa-user text-indigo-500 mr-1"></i> {slide.author}
                  </p>
                )}
                <div className="flex flex-wrap gap-3 text-xs sm:text-sm text-[#5f5f78]">
                  <span>
                    <i className="far fa-calendar-alt text-indigo-500 mr-1"></i> {slide.date}
                  </span>
                  <span>
                    <i className="far fa-clock text-indigo-500 mr-1"></i> {slide.readTime}
                  </span>
                  <span>
                    <i className="far fa-comment text-indigo-500 mr-1"></i> {slide.comments}
                  </span>
                </div>
              </div>
              <div className="flex-1 w-full h-48 sm:h-56 md:h-auto order-1 md:order-2">
                <img 
                  src={slide.image} 
                  alt={slide.alt} 
                  className="w-full h-full object-cover"
                  loading="lazy"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Dots */}
      <div className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 sm:gap-2 z-10">
        {slides.map((_, idx) => (
          <button
            key={idx}
            className={`dot h-2 sm:h-2.5 rounded-full transition-all duration-200 ${
              currentIndex === idx 
                ? 'bg-indigo-600 w-5 sm:w-7' 
                : 'bg-white/60 hover:bg-indigo-400 w-2 sm:w-2.5'
            }`}
            onClick={() => goToSlide(idx)}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>

      {/* Arrows */}
      {slides.length > 1 && (
        <>
          <button 
            onClick={prevSlide}
            className="hidden sm:flex absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 bg-white/70 hover:bg-white text-[#1e1e2a] w-8 h-8 sm:w-9 sm:h-9 rounded-full items-center justify-center shadow-md backdrop-blur-sm transition z-10"
            aria-label="Previous slide"
          >
            <i className="fas fa-chevron-left text-sm sm:text-base"></i>
          </button>
          <button 
            onClick={nextSlide}
            className="hidden sm:flex absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 bg-white/70 hover:bg-white text-[#1e1e2a] w-8 h-8 sm:w-9 sm:h-9 rounded-full items-center justify-center shadow-md backdrop-blur-sm transition z-10"
            aria-label="Next slide"
          >
            <i className="fas fa-chevron-right text-sm sm:text-base"></i>
          </button>
        </>
      )}
    </div>
  );
};

export default HeroSlider;