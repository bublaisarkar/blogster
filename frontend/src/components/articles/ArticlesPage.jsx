// components/articles/ArticlesPage.jsx
import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom'; // ✅ Add this
import ArticleGrid from './ArticleGrid';
import Pagination from './Pagination';
import ArticleFilters from './ArticleFilters';
import useBlog from '../../hooks/useBlog';
import { useCategory } from '../../hooks/useCategory';

const ArticlesPage = ({ initialSort = 'newest' }) => {
  const [searchParams] = useSearchParams(); // ✅ Add this
  const { blogs, loading, fetchBlogs } = useBlog();
  const { categories, fetchCategories } = useCategory();
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  
  // ✅ Get sort from URL params or prop
  const [sort, setSort] = useState(() => {
    const sortParam = searchParams.get('sort');
    return ['newest', 'oldest', 'popular', 'trending'].includes(sortParam)
      ? sortParam
      : initialSort || 'newest';
  });
  
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchBlogs({ status: 'published', limit: 100 });
    fetchCategories();
  }, [fetchBlogs, fetchCategories]);

  // ✅ Sync sort with URL when it changes
  useEffect(() => {
    const sortParam = searchParams.get('sort');
    if (sortParam && ['newest', 'oldest', 'popular', 'trending'].includes(sortParam)) {
      // avoid synchronous setState in effect - schedule update asynchronously
      const t = setTimeout(() => setSort(sortParam), 0);
      return () => clearTimeout(t);
    }
  }, [searchParams]);

  // Transform blogs into article format
  const allArticles = useMemo(() => {
    return blogs.map(blog => {
      const categoryName = blog.categories?.[0]?.name || blog.category || 'General';
      const categorySlug = blog.categories?.[0]?.slug || categoryName.toLowerCase();

      return {
        id: blog._id,
        slug: blog.slug,
        image: blog.coverImage || 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=400&h=250&fit=crop&crop=center&auto=format',
        alt: blog.title,
        category: categorySlug,
        categoryName: categoryName,
        title: blog.title,
        excerpt: blog.excerpt || blog.content?.substring(0, 120) || '',
        author: blog.author?.name || 'Anonymous',
        authorAvatar: blog.author?.avatar || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(blog.author?.name || 'User'),
        date: blog.createdAt || blog.publishedAt,
        likes: blog.likes || 0,
        comments: blog.commentCount || 0
      };
    });
  }, [blogs]);

  // Filter and sort articles
  const filteredArticles = useMemo(() => {
    let filtered = [...allArticles];

    if (activeFilter !== 'all') {
      filtered = filtered.filter(article => article.category === activeFilter);
    }

    if (search.trim()) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(article =>
        article.title.toLowerCase().includes(searchLower) ||
        article.excerpt.toLowerCase().includes(searchLower) ||
        article.author.toLowerCase().includes(searchLower)
      );
    }

    switch (sort) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.date) - new Date(b.date));
        break;
      case 'popular':
        filtered.sort((a, b) => b.likes - a.likes);
        break;
      case 'trending':
        filtered.sort((a, b) => b.comments - a.comments);
        break;
      default:
        break;
    }

    return filtered;
  }, [search, activeFilter, sort, allArticles]);

  const articlesPerPage = 8;
  const totalPages = Math.ceil(filteredArticles.length / articlesPerPage);
  const startIndex = (currentPage - 1) * articlesPerPage;
  const currentArticles = filteredArticles.slice(startIndex, startIndex + articlesPerPage);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
    setCurrentPage(1);
  };

  const handleSearchChange = (value) => {
    setSearch(value);
    setCurrentPage(1);
  };

  const handleSortChange = (value) => {
    setSort(value);
    setCurrentPage(1);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-[#6b6b84]">Loading articles...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <ArticleFilters
        search={search}
        onSearchChange={handleSearchChange}
        activeFilter={activeFilter}
        onFilterChange={handleFilterChange}
        sort={sort}
        onSortChange={handleSortChange}
        categories={categories}
      />
      
      {currentArticles.length === 0 ? (
        <div className="text-center py-12">
          <i className="fas fa-search text-4xl text-[#908db0] mb-4"></i>
          <h3 className="text-xl font-semibold text-[#1e1e2a]">No articles found</h3>
          <p className="text-[#6b6b84]">Try adjusting your search or filter criteria</p>
        </div>
      ) : (
        <>
          <ArticleGrid articles={currentArticles} />
          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          )}
        </>
      )}
    </div>
  );
};

export default ArticlesPage;