import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import useComment from '../../hooks/useComment';
import CommentsStats from '../../components/dashboard/comments/CommentsStats';
import CommentsFilters from '../../components/dashboard/comments/CommentsFilters';
import CommentsTable from '../../components/dashboard/comments/CommentsTable';
import CommentsModals from '../../components/dashboard/comments/CommentsModals';

const CommentsPage = () => {
  const { 
    comments, 
    loading, 
    stats, 
    fetchAllComments, 
    fetchCommentStats,
    updateCommentStatus,
    deleteComment 
  } = useComment();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortFilter, setSortFilter] = useState('newest');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionType, setActionType] = useState('');
  const [selectedComment, setSelectedComment] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // ✅ Fetch comments and stats on mount
  useEffect(() => {
    const loadData = async () => {
      await fetchAllComments();
      await fetchCommentStats();
    };
    loadData();
  }, [fetchAllComments, fetchCommentStats]);

  // ✅ Filter comments locally
  const filteredComments = comments.filter(comment => {
    const matchesSearch = 
      comment.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      comment.blog?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      comment.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || comment.status?.toLowerCase() === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // ✅ Handle approve/unapprove
  const handleAction = (comment, action) => {
    setSelectedComment(comment);
    setActionType(action);
    setShowActionModal(true);
  };

  // ✅ Handle delete
  const handleDelete = (comment) => {
    setSelectedComment(comment);
    setShowDeleteModal(true);
  };

  // ✅ Confirm action (approve/unapprove)
  const confirmAction = async () => {
    if (!selectedComment || isProcessing) return;
    
    setIsProcessing(true);
    const newStatus = actionType === 'approve' ? 'approved' : 'pending';
    const result = await updateCommentStatus(selectedComment._id, newStatus);
    
    if (result.success) {
      // ✅ Toast already in component
      toast.success(`Comment ${actionType === 'approve' ? 'approved' : 'unapproved'} successfully!`);
      await fetchCommentStats(); // Refresh stats
    } else {
      // ✅ Show error toast
      toast.error(result.message || 'Failed to update comment status');
    }
    
    setShowActionModal(false);
    setActionType('');
    setSelectedComment(null);
    setIsProcessing(false);
  };

  // ✅ Confirm delete
  const confirmDelete = async () => {
    if (!selectedComment || isProcessing) return;
    
    setIsProcessing(true);
    const result = await deleteComment(selectedComment._id);
    
    if (result.success) {
      // ✅ Toast already in component
      toast.success('Comment deleted successfully!');
      await fetchCommentStats(); // Refresh stats
    } else {
      // ✅ Show error toast
      toast.error(result.message || 'Failed to delete comment');
    }
    
    setShowDeleteModal(false);
    setSelectedComment(null);
    setIsProcessing(false);
  };

  // ✅ Loading state
  if (loading && comments.length === 0) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 pt-4 pb-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-[#6b6b84]">Loading comments...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 pt-4 pb-8">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#14141f]">Comments</h1>
          <p className="text-[#6b6b84] text-sm">Manage all comments across your blog</p>
        </div>
      </div>

      {/* Stats */}
      <CommentsStats stats={stats} />

      {/* Filters */}
      <CommentsFilters 
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        sortFilter={sortFilter}
        onSortChange={setSortFilter}
      />

      {/* Comments Table */}
      <CommentsTable 
        comments={filteredComments}
        loading={loading}
        onAction={handleAction}
        onDelete={handleDelete}
      />

      {/* Modals */}
      <CommentsModals 
        showActionModal={showActionModal}
        showDeleteModal={showDeleteModal}
        actionType={actionType}
        onCloseAction={() => setShowActionModal(false)}
        onCloseDelete={() => setShowDeleteModal(false)}
        onConfirmAction={confirmAction}
        onConfirmDelete={confirmDelete}
        isProcessing={isProcessing}
      />
    </div>
  );
};

export default CommentsPage;