// components/dashboard/DashboardTable.jsx
import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import BlogTable from '../dashboard/bloglist/BlogTable';
import BlogModals from '../dashboard/bloglist/BlogModals';

const DashboardTable = ({ blogs, loading, onEdit, onDelete, onUnpublish, onPublish }) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showUnpublishModal, setShowUnpublishModal] = useState(false);
  const [selectedBlog, setSelectedBlog] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Only show latest 5 blogs
  const displayBlogs = blogs?.slice(0, 5) || [];

  const handleDelete = useCallback((blog) => {
    setSelectedBlog(blog);
    setShowDeleteModal(true);
  }, []);

  const handleUnpublish = useCallback((blog) => {
    setSelectedBlog(blog);
    setShowUnpublishModal(true);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (!selectedBlog) return;
    setIsSubmitting(true);
    try {
      await onDelete(selectedBlog._id);
      setShowDeleteModal(false);
      setSelectedBlog(null);
    } finally {
      setIsSubmitting(false);
    }
  }, [selectedBlog, onDelete]);

  const confirmUnpublish = useCallback(async () => {
    if (!selectedBlog) return;
    setIsSubmitting(true);
    try {
      await onUnpublish(selectedBlog._id);
      setShowUnpublishModal(false);
      setSelectedBlog(null);
    } finally {
      setIsSubmitting(false);
    }
  }, [selectedBlog, onUnpublish]);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-[#edebf5] shadow-sm overflow-hidden">
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-[#6b6b84]">Loading blogs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-[#edebf5] shadow-sm overflow-hidden">
      {/* Header: only "View All" link – responsive padding + vertical centering */}
      <div className="px-4 py-2 sm:py-3 border-b border-[#e6e6ed] flex items-center justify-end">
        <Link 
          to="/dashboard/blog-lists" 
          className="text-sm text-indigo-600 hover:text-indigo-800 transition font-medium mt-1 sm:mt-0"
        >
          View All <i className="fas fa-arrow-right ml-1"></i>
        </Link>
      </div>

      {displayBlogs.length === 0 ? (
        <div className="p-8 text-center">
          <p className="text-[#6b6b84]">No blogs found. Create your first blog post!</p>
          <Link 
            to="/dashboard/add-blog" 
            className="inline-block mt-4 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl font-medium transition text-sm"
          >
            <i className="fas fa-plus mr-1"></i> Create Blog
          </Link>
        </div>
      ) : (
        <>
          <BlogTable
            blogs={displayBlogs}
            loading={false}
            onEdit={onEdit}
            onDelete={handleDelete}
            onUnpublish={handleUnpublish}
            onPublish={onPublish}
          />

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
        </>
      )}
    </div>
  );
};

export default DashboardTable;