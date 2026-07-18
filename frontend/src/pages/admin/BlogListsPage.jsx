// pages/admin/BlogListsPage.jsx
import { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import useBlog from '../../hooks/useBlog';

import BlogFilters from '../../components/dashboard/bloglist/BlogFilters';
import BlogTable from '../../components/dashboard/bloglist/BlogTable';
import BlogModals from '../../components/dashboard/bloglist/BlogModals';

const BlogListsPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { blogs, loading, fetchBlogs, deleteBlog, publishBlog, unpublishBlog } = useBlog();

  // ✅ statusFilter is derived from URL – no local state needed
  const statusFilter = searchParams.get('status') || 'all';

  const [searchTerm, setSearchTerm] = useState('');
  const [sortFilter, setSortFilter] = useState('newest');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showUnpublishModal, setShowUnpublishModal] = useState(false);
  const [selectedBlog, setSelectedBlog] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ✅ Update URL when status changes
  const handleStatusChange = useCallback((newStatus) => {
    const newParams = new URLSearchParams(searchParams);
    if (newStatus === 'all') {
      newParams.delete('status');
    } else {
      newParams.set('status', newStatus);
    }
    setSearchParams(newParams);
  }, [searchParams, setSearchParams]);

  // ✅ Fetch blogs with filters – send status as is (backend handles 'all')
  useEffect(() => {
    fetchBlogs({
      status: statusFilter, // ✅ send 'all' or specific status
      limit: 100,
    });
  }, [statusFilter, fetchBlogs]);

  // ✅ Filter and sort blogs
  const filteredBlogs = blogs
    .filter(blog => {
      if (searchTerm) {
        return blog.title?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
      }
      return true;
    })
    .sort((a, b) => {
      switch (sortFilter) {
        case 'newest':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'oldest':
          return new Date(a.createdAt) - new Date(b.createdAt);
        case 'title':
          return a.title?.localeCompare(b.title) || 0;
        case 'title-desc':
          return b.title?.localeCompare(a.title) || 0;
        default:
          return 0;
      }
    });

  // ✅ Handlers
  const handleEdit = useCallback((blog) => {
    navigate(`/dashboard/edit-blog/${blog._id}`);
  }, [navigate]);

  const handleDelete = useCallback((blog) => {
    setSelectedBlog(blog);
    setShowDeleteModal(true);
  }, []);

  const handleUnpublish = useCallback((blog) => {
    setSelectedBlog(blog);
    setShowUnpublishModal(true);
  }, []);

  const handlePublish = useCallback(async (blog) => {
    setIsSubmitting(true);
    try {
      await publishBlog(blog._id);
    } finally {
      setIsSubmitting(false);
    }
  }, [publishBlog]);

  const confirmDelete = useCallback(async () => {
    if (!selectedBlog) return;
    setIsSubmitting(true);
    try {
      await deleteBlog(selectedBlog._id);
      setShowDeleteModal(false);
      setSelectedBlog(null);
    } finally {
      setIsSubmitting(false);
    }
  }, [selectedBlog, deleteBlog]);

  const confirmUnpublish = useCallback(async () => {
    if (!selectedBlog) return;
    setIsSubmitting(true);
    try {
      await unpublishBlog(selectedBlog._id);
      setShowUnpublishModal(false);
      setSelectedBlog(null);
    } finally {
      setIsSubmitting(false);
    }
  }, [selectedBlog, unpublishBlog]);

  const resetFilters = useCallback(() => {
    setSearchTerm('');
    setSortFilter('newest');
    setSearchParams({});
  }, [setSearchParams]);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#14141f]">Blog Lists</h1>
          <p className="text-[#6b6b84] text-sm">Manage all your blog posts</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/dashboard/add-blog"
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl font-medium transition text-sm flex items-center gap-2"
          >
            <i className="fas fa-plus"></i> New Blog
          </Link>
        </div>
      </div>

      {/* Filters */}
      <BlogFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusChange={handleStatusChange}
        sortFilter={sortFilter}
        onSortChange={setSortFilter}
        onReset={resetFilters}
      />

      {/* Results count */}
      <div className="mb-4 text-sm text-[#6b6b84]">
        Showing {filteredBlogs.length} of {blogs.length} blogs
        {searchTerm && ` (filtered by "${searchTerm}")`}
        {statusFilter !== 'all' && ` (status: ${statusFilter})`}
      </div>

      {/* Blog Table */}
      <BlogTable
        blogs={filteredBlogs}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onUnpublish={handleUnpublish}
        onPublish={handlePublish}
      />

      {/* Modals */}
      <BlogModals
        showDeleteModal={showDeleteModal}
        showUnpublishModal={showUnpublishModal}
        selectedBlog={selectedBlog}
        onCloseDelete={() => setShowDeleteModal(false)}
        onCloseUnpublish={() => setShowUnpublishModal(false)}
        onConfirmDelete={confirmDelete}
        onConfirmUnpublish={confirmUnpublish}
        loading={isSubmitting}
      />
    </div>
  );
};

export default BlogListsPage;