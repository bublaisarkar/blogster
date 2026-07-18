import { useState, useEffect, useMemo, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import toast from 'react-hot-toast';
import 'highlight.js/styles/github-dark.css';

const BlogContent = ({ content, tags = [], onImageClick }) => {
  const [progress, setProgress] = useState(0);
  const contentRef = useRef(null);

  // ✅ Use useMemo instead of useEffect for derived state
  const images = useMemo(() => {
    if (!content) return [];
    
    const imgRegex = /<img[^>]+src="([^">]+)"/g;
    const matches = content.matchAll(imgRegex);
    const extractedImages = [];
    
    for (const match of matches) {
      extractedImages.push(match[1]);
    }
    
    return extractedImages;
  }, [content]);

  // ✅ Extract headings for Table of Contents with proper IDs
  const headings = useMemo(() => {
    if (!content) return [];
    
    // Match both HTML headings and Markdown headings
    const headingRegex = /<h([1-6])[^>]*>(.*?)<\/h[1-6]>/gi;
    const matches = content.matchAll(headingRegex);
    const extractedHeadings = [];
    
    for (const match of matches) {
      const level = parseInt(match[1], 10);
      const text = match[2].replace(/<[^>]*>/g, '').trim();
      if (text) {
        const id = text
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '');
        
        extractedHeadings.push({
          level,
          text,
          id: id || `heading-${extractedHeadings.length + 1}`
        });
      }
    }
    
    return extractedHeadings;
  }, [content]);

  // ✅ Add IDs to headings in the DOM after render
  useEffect(() => {
    if (contentRef.current) {
      const allHeadings = contentRef.current.querySelectorAll('h1, h2, h3, h4, h5, h6');
      allHeadings.forEach((heading, index) => {
        if (!heading.id) {
          const text = heading.textContent || heading.innerText || '';
          const id = text
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
          heading.id = id || `heading-${index}`;
        }
      });
    }
  }, [content]);

  // Reading progress bar
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progressValue = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      setProgress(Math.min(progressValue, 100));
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle image click for lightbox
  const handleImageClick = (src) => {
    if (onImageClick) {
      onImageClick(src);
    }
  };

  // ✅ Scroll to heading with smooth scroll - FIXED
  const scrollToHeading = (id) => {
    // First try to find by ID
    let element = document.getElementById(id);
    
    // If not found, try to find by text content
    if (!element && contentRef.current) {
      const allHeadings = contentRef.current.querySelectorAll('h1, h2, h3, h4, h5, h6');
      for (const heading of allHeadings) {
        const text = heading.textContent || heading.innerText || '';
        const headingId = text
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '');
        if (headingId === id) {
          element = heading;
          break;
        }
      }
    }
    
    if (element) {
      const offset = 100; // Increased offset for better positioning
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;
      
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
      
      // ✅ Highlight the heading briefly
      element.style.transition = 'background-color 0.5s ease';
      element.style.backgroundColor = '#e0e7ff';
      setTimeout(() => {
        element.style.backgroundColor = 'transparent';
      }, 1500);
    } else {
      // ✅ Fallback: try to find by ID with a delay (for dynamic content)
      setTimeout(() => {
        const fallbackElement = document.getElementById(id);
        if (fallbackElement) {
          const offset = 100;
          const elementPosition = fallbackElement.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - offset;
          
          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
        }
      }, 100);
    }
  };

  // Render HTML content
  const renderHTMLContent = () => {
    if (!content) return null;

    return (
      <div 
        ref={contentRef}
        className="blog-content prose prose-lg max-w-none text-[#2d2d3f]"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    );
  };

  // Render Markdown content
  const renderMarkdownContent = () => {
    if (!content) return null;

    return (
      <div 
        ref={contentRef}
        className="blog-content prose prose-lg max-w-none text-[#2d2d3f] prose-headings:text-[#14141f] prose-a:text-indigo-600 prose-a:no-underline hover:prose-a:underline prose-img:rounded-2xl prose-img:shadow-sm prose-code:bg-[#f3f1fb] prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-indigo-600 prose-pre:bg-[#0d1117] prose-pre:rounded-xl prose-pre:p-6 prose-pre:overflow-x-auto"
      >
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeHighlight]}
          components={{
            img: ({ src, alt, ...props }) => (
              <div className="image-container max-w-2xl mx-auto my-6">
                <img 
                  src={src} 
                  alt={alt || 'Blog image'} 
                  className="w-full rounded-2xl shadow-sm hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => handleImageClick(src)}
                  loading="lazy"
                  {...props}
                />
                {alt && (
                  <span className="block text-center text-sm text-[#6b6b84] mt-2">
                    {alt}
                  </span>
                )}
              </div>
            ),
            h1: ({ children }) => {
              const text = children?.toString() || '';
              const id = text
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-+|-+$/g, '');
              return (
                <h1 id={id} className="text-3xl sm:text-4xl font-bold text-[#14141f] mt-8 mb-4">
                  {children}
                </h1>
              );
            },
            h2: ({ children }) => {
              const text = children?.toString() || '';
              const id = text
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-+|-+$/g, '');
              return (
                <h2 id={id} className="text-2xl sm:text-3xl font-bold text-[#14141f] mt-8 pt-2 mb-4">
                  {children}
                </h2>
              );
            },
            h3: ({ children }) => {
              const text = children?.toString() || '';
              const id = text
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-+|-+$/g, '');
              return (
                <h3 id={id} className="text-xl sm:text-2xl font-bold text-[#14141f] mt-6 mb-3">
                  {children}
                </h3>
              );
            },
            blockquote: ({ children }) => (
              <blockquote className="border-l-4 border-indigo-600 bg-[#f8f7fc] p-6 rounded-r-xl my-6">
                <div className="text-lg sm:text-xl font-medium text-[#1e1e2a] italic">
                  {children}
                </div>
              </blockquote>
            ),
            code: ({ inline, className, children, ...props }) => {
              const codeString = String(children).replace(/\n$/, '');
              
              return !inline ? (
                <div className="relative group">
                  <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(codeString);
                        toast.success('Code copied!');
                      }}
                      className="text-xs bg-[#2d2d3f] text-white px-3 py-1 rounded-lg hover:bg-[#3d3d4f] transition"
                    >
                      <i className="fas fa-copy mr-1"></i> Copy
                    </button>
                  </div>
                  <pre className="bg-[#0d1117] rounded-xl p-6 overflow-x-auto">
                    <code className={`text-[#e6edf3] font-mono text-sm leading-relaxed ${className || ''}`} {...props}>
                      {children}
                    </code>
                  </pre>
                </div>
              ) : (
                <code className="bg-[#f3f1fb] px-1.5 py-0.5 rounded text-indigo-600 font-mono text-sm" {...props}>
                  {children}
                </code>
              );
            },
            ul: ({ children }) => (
              <ul className="list-disc pl-6 space-y-2 text-[#2d2d3f]">
                {children}
              </ul>
            ),
            ol: ({ children }) => (
              <ol className="list-decimal pl-6 space-y-2 text-[#2d2d3f]">
                {children}
              </ol>
            ),
            a: ({ href, children }) => (
              <a 
                href={href} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-indigo-600 hover:text-indigo-800 underline decoration-indigo-200 hover:decoration-indigo-600 transition"
              >
                {children}
              </a>
            ),
            table: ({ children }) => (
              <div className="overflow-x-auto my-6">
                <table className="min-w-full border border-[#e6e6ed] rounded-xl overflow-hidden">
                  {children}
                </table>
              </div>
            ),
            th: ({ children }) => (
              <th className="bg-[#f8f7fc] px-4 py-3 text-left text-sm font-semibold text-[#14141f] border-b border-[#e6e6ed]">
                {children}
              </th>
            ),
            td: ({ children }) => (
              <td className="px-4 py-3 text-sm text-[#2d2d3f] border-b border-[#e6e6ed]">
                {children}
              </td>
            )
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    );
  };

  // Detect if content is HTML or Markdown
  const isHTML = (content) => {
    if (!content) return false;
    return /<[a-z][\s\S]*>/i.test(content);
  };

  // Image Gallery (if multiple images)
  const renderImageGallery = () => {
    if (images.length <= 1) return null;

    return (
      <div className="my-8">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {images.slice(0, 6).map((src, index) => (
            <img
              key={index}
              src={src}
              alt={`Gallery ${index + 1}`}
              className="w-full h-32 object-cover rounded-xl shadow-sm hover:shadow-md transition cursor-pointer"
              onClick={() => handleImageClick(src)}
              loading="lazy"
            />
          ))}
          {images.length > 6 && (
            <div className="relative h-32 rounded-xl bg-[#f0eef8] flex items-center justify-center cursor-pointer hover:bg-[#e6e6ed] transition">
              <span className="text-2xl font-bold text-[#6b6b84]">+{images.length - 6}</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  // ✅ Table of Contents - Fixed with proper IDs and scrolling
  const renderTableOfContents = () => {
    if (headings.length < 2) return null;

    return (
      <div className="bg-[#f8f7fc] rounded-2xl p-6 mb-8 border border-[#edebf5]">
        <h4 className="text-sm font-semibold text-[#14141f] mb-3 flex items-center gap-2">
          <i className="fas fa-list-ul text-indigo-600"></i>
          Table of Contents
        </h4>
        <ul className="space-y-1.5">
          {headings.map((heading, index) => (
            <li key={index} className={`${heading.level === 3 ? 'ml-4' : heading.level >= 4 ? 'ml-8' : ''}`}>
              <button
                type="button"
                onClick={() => scrollToHeading(heading.id)}
                className="text-sm text-[#4a4a5e] hover:text-indigo-600 transition text-left cursor-pointer hover:underline w-full"
              >
                {heading.text}
              </button>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  return (
    <div className="relative">
      {/* Reading Progress Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-[#f0eef8]">
        <div 
          className="h-full bg-indigo-600 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Table of Contents */}
      {renderTableOfContents()}

      {/* Main Content */}
      <div className="post-content">
        {isHTML(content) ? renderHTMLContent() : renderMarkdownContent()}
      </div>

      {/* Image Gallery */}
      {renderImageGallery()}

      {/* Tags */}
      {tags && tags.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 pt-4 mt-8 border-t border-[#f0eef8]">
          <span className="text-sm font-medium text-[#6b6b84]">
            <i className="fas fa-tags mr-1"></i> Tags:
          </span>
          {tags.map((tag, index) => (
            <span 
              key={index}
              className="bg-[#f3f1fb] px-3 py-1 rounded-full text-xs font-medium text-[#2c2c44] border border-transparent transition cursor-default hover:bg-indigo-100 hover:text-indigo-700 hover:border-indigo-300"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Share Section */}
      <div className="flex items-center gap-4 pt-4 mt-4 border-t border-[#f0eef8]">
        <span className="text-sm text-[#6b6b84]">Share this article:</span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(document.title)}&url=${encodeURIComponent(window.location.href)}`, '_blank')}
            className="w-9 h-9 rounded-full bg-[#f3f1fb] hover:bg-[#1DA1F2] transition flex items-center justify-center text-[#6b6b84] hover:text-white"
          >
            <i className="fab fa-twitter text-sm"></i>
          </button>
          <button
            type="button"
            onClick={() => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`, '_blank')}
            className="w-9 h-9 rounded-full bg-[#f3f1fb] hover:bg-[#0A66C2] transition flex items-center justify-center text-[#6b6b84] hover:text-white"
          >
            <i className="fab fa-linkedin-in text-sm"></i>
          </button>
          <button
            type="button"
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              toast.success('Link copied to clipboard!');
            }}
            className="w-9 h-9 rounded-full bg-[#f3f1fb] hover:bg-indigo-600 transition flex items-center justify-center text-[#6b6b84] hover:text-white"
          >
            <i className="fas fa-link text-sm"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default BlogContent;