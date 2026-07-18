
const BlogModals = ({ 
  showDeleteModal, 
  showUnpublishModal, 
  selectedBlog, 
  onCloseDelete, 
  onCloseUnpublish, 
  onConfirmDelete, 
  onConfirmUnpublish,
  loading = false
}) => {
  // Close on backdrop click
  const handleBackdropClick = (e, onClose) => {
    if (e.target === e.currentTarget && !loading) {
      onClose();
    }
  };

  return (
    <>
      {/* Delete Modal */}
      {showDeleteModal && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={(e) => handleBackdropClick(e, onCloseDelete)}
        >
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-trash text-red-600 text-2xl"></i>
              </div>
              <h3 className="text-xl font-bold text-[#14141f] mb-2">Delete Blog</h3>
              <p className="text-[#6b6b84] text-sm">
                Are you sure you want to delete "<span className="font-semibold text-[#1e1e2a]">{selectedBlog?.title || 'this blog'}</span>"? 
                This action cannot be undone.
              </p>
              <div className="flex gap-3 mt-6">
                <button 
                  onClick={onCloseDelete}
                  disabled={loading}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-[#e6e6ed] hover:bg-[#faf9f6] transition text-sm font-medium text-[#2d2d3f] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button 
                  onClick={onConfirmDelete}
                  disabled={loading}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white transition text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i> Deleting...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-trash"></i> Delete
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Unpublish Modal */}
      {showUnpublishModal && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={(e) => handleBackdropClick(e, onCloseUnpublish)}
        >
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl">
            <div className="text-center">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-eye-slash text-amber-600 text-2xl"></i>
              </div>
              <h3 className="text-xl font-bold text-[#14141f] mb-2">Unpublish Blog</h3>
              <p className="text-[#6b6b84] text-sm">
                Are you sure you want to unpublish "<span className="font-semibold text-[#1e1e2a]">{selectedBlog?.title || 'this blog'}</span>"? 
                It will no longer be visible to the public.
              </p>
              <div className="flex gap-3 mt-6">
                <button 
                  onClick={onCloseUnpublish}
                  disabled={loading}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-[#e6e6ed] hover:bg-[#faf9f6] transition text-sm font-medium text-[#2d2d3f] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button 
                  onClick={onConfirmUnpublish}
                  disabled={loading}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white transition text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i> Unpublishing...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-eye-slash"></i> Unpublish
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BlogModals;