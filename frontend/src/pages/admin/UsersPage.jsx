import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import useAuth from '../../hooks/useAuth';
import UsersStats from '../../components/dashboard/users/UsersStats';
import UsersFilters from '../../components/dashboard/users/UsersFilters';
import UsersTable from '../../components/dashboard/users/UsersTable';
import UsersModals from '../../components/dashboard/users/UsersModals';
import UserForm from '../../components/dashboard/users/UserForm';
import axios from '../../api/axios';

const UsersPage = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showActionModal, setShowActionModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showUserForm, setShowUserForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [actionType, setActionType] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    pending: 0
  });

  // ✅ Fetch users from API
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axios.get('/users');
      if (data.success) {
        setUsers(data.data);
        // Calculate stats
        const total = data.data.length;
        const active = data.data.filter(u => u.status === 'active').length;
        const inactive = data.data.filter(u => u.status === 'inactive').length;
        const pending = data.data.filter(u => u.status === 'pending').length;
        setStats({ total, active, inactive, pending });
      } else {
        toast.error(data.message || 'Failed to fetch users');
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to fetch users';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ Fetch users on mount
  useEffect(() => {
    const loadUsers = async () => {
      await fetchUsers();
    };
    loadUsers();
  }, [fetchUsers]);

  // ✅ Filter users locally
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role?.toLowerCase() === roleFilter;
    const matchesStatus = statusFilter === 'all' || user.status?.toLowerCase() === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  // ✅ Handle user action (block/activate/approve)
  const handleAction = (user, action) => {
    setSelectedUser(user);
    setActionType(action);
    setShowActionModal(true);
  };

  // ✅ Handle delete
  const handleDelete = (user) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  // ✅ Handle edit user
  const handleEditUser = (user) => {
    setEditingUser(user);
    setShowUserForm(true);
  };

  // ✅ Handle add user
  const handleAddUser = () => {
    setEditingUser(null);
    setShowUserForm(true);
  };

  // ✅ Handle user form success
  const handleUserFormSuccess = () => {
    fetchUsers();
    setShowUserForm(false);
    setEditingUser(null);
  };

  // ✅ Confirm action (block/activate/approve)
  const confirmAction = async () => {
    if (!selectedUser) return;
    setIsSubmitting(true);

    let status = '';
    let actionMessage = '';
    
    if (actionType === 'block') {
      status = 'inactive';
      actionMessage = 'Blocked';
    } else if (actionType === 'activate') {
      status = 'active';
      actionMessage = 'Activated';
    } else if (actionType === 'approve') {
      status = 'active';
      actionMessage = 'Approved';
    }

    try {
      const { data } = await axios.put(`/users/${selectedUser._id}/status`, { status });
      if (data.success) {
        toast.success(`User "${selectedUser.name}" ${actionMessage} successfully!`);
        await fetchUsers();
        setShowActionModal(false);
        setSelectedUser(null);
        setActionType('');
      } else {
        toast.error(data.message || 'Failed to update user status');
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to update user status';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ✅ Confirm delete
  const confirmDelete = async () => {
    if (!selectedUser) return;
    setIsSubmitting(true);

    try {
      const { data } = await axios.delete(`/users/${selectedUser._id}`);
      if (data.success) {
        toast.success(`User "${selectedUser.name}" deleted successfully!`);
        await fetchUsers();
        setShowDeleteModal(false);
        setSelectedUser(null);
      } else {
        toast.error(data.message || 'Failed to delete user');
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to delete user';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ✅ Reset filters
  const resetFilters = () => {
    setSearchTerm('');
    setRoleFilter('all');
    setStatusFilter('all');
  };

  // ✅ Loading state
  if (loading && users.length === 0) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 pt-4 pb-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-[#6b6b84]">Loading users...</p>
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
          <h1 className="text-2xl sm:text-3xl font-bold text-[#14141f]">Users</h1>
          <p className="text-[#6b6b84] text-sm">Manage all users on your blog platform</p>
        </div>
        <button 
          onClick={handleAddUser}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl font-medium transition text-sm flex items-center gap-2"
        >
          <i className="fas fa-user-plus"></i> Add User
        </button>
      </div>

      {/* Stats */}
      <UsersStats stats={stats} />

      {/* Filters */}
      <UsersFilters 
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        roleFilter={roleFilter}
        onRoleChange={setRoleFilter}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        onReset={resetFilters}
      />

      {/* Results count */}
      <div className="mb-4 text-sm text-[#6b6b84]">
        Showing {filteredUsers.length} of {users.length} users
        {searchTerm && ` (filtered by "${searchTerm}")`}
        {roleFilter !== 'all' && ` (role: ${roleFilter})`}
        {statusFilter !== 'all' && ` (status: ${statusFilter})`}
      </div>

      {/* Users Table */}
      <UsersTable 
        users={filteredUsers}
        loading={loading}
        onAction={handleAction}
        onDelete={handleDelete}
        onEdit={handleEditUser}
        currentUser={currentUser}
      />

      {/* User Form Modal */}
      {showUserForm && (
        <UserForm
          user={editingUser}
          onClose={() => {
            setShowUserForm(false);
            setEditingUser(null);
          }}
          onSuccess={handleUserFormSuccess}
        />
      )}

      {/* Modals */}
      <UsersModals 
        showActionModal={showActionModal}
        showDeleteModal={showDeleteModal}
        actionType={actionType}
        selectedUser={selectedUser}
        onCloseAction={() => setShowActionModal(false)}
        onCloseDelete={() => setShowDeleteModal(false)}
        onConfirmAction={confirmAction}
        onConfirmDelete={confirmDelete}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};

export default UsersPage;