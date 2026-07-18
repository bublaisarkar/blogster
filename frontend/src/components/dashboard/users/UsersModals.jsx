
const UsersModals = ({ 
  showActionModal, 
  showDeleteModal, 
  actionType, 
  selectedUser, 
  onCloseAction, 
  onCloseDelete, 
  onConfirmAction, 
  onConfirmDelete 
}) => {
  return (
    <>
      {/* Action Modal (Block/Activate/Approve) */}
      {showActionModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl">
            <div className="text-center">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                actionType === 'block' ? 'bg-amber-100' : 'bg-emerald-100'
              }`}>
                <i className={`fas ${
                  actionType === 'block' ? 'fa-ban' : 'fa-check-circle'
                } ${
                  actionType === 'block' ? 'text-amber-600' : 'text-emerald-600'
                } text-2xl`}></i>
              </div>
              <h3 className="text-xl font-bold text-[#14141f] mb-2">
                {actionType === 'block' ? 'Block User' : 
                 actionType === 'activate' ? 'Activate User' : 'Approve User'}
              </h3>
              <p className="text-[#6b6b84] text-sm">
                Are you sure you want to {actionType === 'block' ? 'block' : 
                 actionType === 'activate' ? 'activate' : 'approve'} 
                "<span className="font-semibold text-[#1e1e2a]">{selectedUser?.name}</span>"?
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
                    actionType === 'block' ? 'bg-amber-600 hover:bg-amber-700' : 'bg-emerald-600 hover:bg-emerald-700'
                  }`}
                >
                  {actionType === 'block' ? 'Block' : 
                   actionType === 'activate' ? 'Activate' : 'Approve'}
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
              <h3 className="text-xl font-bold text-[#14141f] mb-2">Delete User</h3>
              <p className="text-[#6b6b84] text-sm">
                Are you sure you want to delete "<span className="font-semibold text-[#1e1e2a]">{selectedUser?.name}</span>"? 
                This action cannot be undone.
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

export default UsersModals;