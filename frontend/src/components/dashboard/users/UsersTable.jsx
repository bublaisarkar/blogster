import React from 'react';
import UsersTableRow from './UsersTableRow';

const UsersTable = ({ users, loading, onAction, onDelete, onEdit, currentUser }) => {
  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-[#edebf5] shadow-sm overflow-hidden">
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-[#6b6b84]">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-[#edebf5] shadow-sm overflow-hidden">
      <div className="px-4 sm:px-6 py-4 border-b border-[#e6e6ed] flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-[#14141f] flex items-center gap-2">
          <i className="fas fa-users text-indigo-600"></i> All Users
          <span className="text-sm font-normal text-[#6b6b84]">({users.length} total)</span>
        </h2>
        <div className="flex items-center gap-2">
          <button className="text-sm text-[#6b6b84] hover:text-[#1e1e2a] transition px-3 py-1 rounded-lg border border-[#e6e6ed]">
            <i className="fas fa-download"></i> Export
          </button>
        </div>
      </div>

      {users.length === 0 ? (
        <div className="p-8 text-center">
          <p className="text-[#6b6b84]">No users found.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#e6e6ed] bg-[#faf9f6]">
                <th className="text-left px-4 sm:px-6 py-3 text-xs font-semibold text-[#6b6b84] uppercase tracking-wider">#</th>
                <th className="text-left px-4 sm:px-6 py-3 text-xs font-semibold text-[#6b6b84] uppercase tracking-wider">User</th>
                <th className="text-left px-4 sm:px-6 py-3 text-xs font-semibold text-[#6b6b84] uppercase tracking-wider hidden sm:table-cell">Email</th>
                <th className="text-left px-4 sm:px-6 py-3 text-xs font-semibold text-[#6b6b84] uppercase tracking-wider hidden md:table-cell">Joined</th>
                <th className="text-left px-4 sm:px-6 py-3 text-xs font-semibold text-[#6b6b84] uppercase tracking-wider">Role</th>
                <th className="text-left px-4 sm:px-6 py-3 text-xs font-semibold text-[#6b6b84] uppercase tracking-wider">Status</th>
                <th className="text-left px-4 sm:px-6 py-3 text-xs font-semibold text-[#6b6b84] uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0eef8]">
              {users.map((user, index) => (
                <UsersTableRow
                  key={user._id || index}
                  user={user}
                  index={index}
                  onAction={onAction}
                  onDelete={onDelete}
                  onEdit={onEdit}
                  currentUser={currentUser}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="px-4 sm:px-6 py-4 border-t border-[#e6e6ed] flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-[#6b6b84]">Showing 1-{users.length} of {users.length} users</p>
        <div className="flex items-center gap-1 sm:gap-2">
          <button className="px-2 sm:px-3 py-1 rounded-lg border border-[#e6e6ed] bg-white text-sm font-medium text-[#4a4a5e] hover:bg-[#f0eff5] transition">
            <i className="fas fa-chevron-left"></i>
          </button>
          <button className="px-3 sm:px-4 py-1 rounded-lg bg-indigo-600 text-white text-sm font-medium">1</button>
          <button className="px-3 sm:px-4 py-1 rounded-lg border border-[#e6e6ed] bg-white text-sm font-medium text-[#4a4a5e] hover:bg-[#f0eff5] transition">2</button>
          <button className="px-3 sm:px-4 py-1 rounded-lg border border-[#e6e6ed] bg-white text-sm font-medium text-[#4a4a5e] hover:bg-[#f0eff5] transition">3</button>
          <button className="px-2 sm:px-3 py-1 rounded-lg border border-[#e6e6ed] bg-white text-sm font-medium text-[#4a4a5e] hover:bg-[#f0eff5] transition">
            <i className="fas fa-chevron-right"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default UsersTable;