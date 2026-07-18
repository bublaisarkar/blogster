
const CommentsModals = ({ 
  showActionModal, 
  showDeleteModal, 
  actionType, 
  onCloseAction, 
  onCloseDelete, 
  onConfirmAction, 
  onConfirmDelete 
}) => {
  return (
    <>
      {/* Action Modal (Approve/Unapprove) */}
      {showActionModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl">
            <div className="text-center">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                actionType === 'approve' ? 'bg-emerald-100' : 'bg-amber-100'
              }`}>
                <i className={`fas ${actionType === 'approve' ? 'fa-check-circle' : 'fa-times-circle'} ${
                  actionType === 'approve' ? 'text-emerald-600' : 'text-amber-600'
                } text-2xl`}></i>
              </div>
              <h3 className="text-xl font-bold text-[#14141f] mb-2">
                {actionType === 'approve' ? 'Approve Comment' : 'Unapprove Comment'}
              </h3>
              <p className="text-[#6b6b84] text-sm">
                Are you sure you want to {actionType === 'approve' ? 'approve' : 'unapprove'} this comment?
              </p>
              <div className="flex gap-3 mt-6">
                <button 
                  onClick={onCloseAction}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-[#e6e6ed] hover:bg-[#faf9f6] transition text-sm font-medium text-[#2d2d3f]"
                >
                  Cancel
                </button>
                <button 
                  onClick={onConfirmAction}
                  className={`flex-1 px-4 py-2.5 rounded-xl text-white transition text-sm font-medium ${
                    actionType === 'approve' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-amber-600 hover:bg-amber-700'
                  }`}
                >
                  {actionType === 'approve' ? 'Approve' : 'Unapprove'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-trash text-red-600 text-2xl"></i>
              </div>
              <h3 className="text-xl font-bold text-[#14141f] mb-2">Delete Comment</h3>
              <p className="text-[#6b6b84] text-sm">
                Are you sure you want to delete this comment? This action cannot be undone.
              </p>
              <div className="flex gap-3 mt-6">
                <button 
                  onClick={onCloseDelete}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-[#e6e6ed] hover:bg-[#faf9f6] transition text-sm font-medium text-[#2d2d3f]"
                >
                  Cancel
                </button>
                <button 
                  onClick={onConfirmDelete}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white transition text-sm font-medium"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CommentsModals;