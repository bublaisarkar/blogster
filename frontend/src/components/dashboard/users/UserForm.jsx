import  { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import axios from '../../../api/axios';

const UserForm = ({ user, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user',
    status: 'active',
    bio: '',
    location: ''
  });
  const [loading, setLoading] = useState(false);
  const isEditing = !!user;

  // ✅ Initialize form data when user prop changes - using useMemo or separate function
  useEffect(() => {
    if (user) {
      // ✅ Use a function to batch the state updates
      const initializeForm = () => {
        setFormData({
          name: user.name || '',
          email: user.email || '',
          password: '',
          role: user.role || 'user',
          status: user.status || 'active',
          bio: user.bio || '',
          location: user.location || ''
        });
      };
      initializeForm();
    } else {
      // ✅ Reset form when user is null
      const resetForm = () => {
        setFormData({
          name: '',
          email: '',
          password: '',
          role: 'user',
          status: 'active',
          bio: '',
          location: ''
        });
      };
      resetForm();
    }
  }, [user]); // ✅ Only runs when user changes

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate
      if (!formData.name.trim()) {
        toast.error('Please enter a name');
        setLoading(false);
        return;
      }
      if (!formData.email.trim()) {
        toast.error('Please enter an email');
        setLoading(false);
        return;
      }
      if (!isEditing && !formData.password) {
        toast.error('Please enter a password');
        setLoading(false);
        return;
      }
      if (!isEditing && formData.password.length < 6) {
        toast.error('Password must be at least 6 characters');
        setLoading(false);
        return;
      }

      // Prepare data
      const data = {
        name: formData.name,
        email: formData.email,
        role: formData.role,
        status: formData.status,
        bio: formData.bio || '',
        location: formData.location || ''
      };

      if (formData.password) {
        data.password = formData.password;
      }

      const url = isEditing ? `/users/${user._id}` : '/users';
      const method = isEditing ? 'put' : 'post';

      const { data: responseData } = await axios[method](url, data);
      
      if (responseData.success) {
        toast.success(isEditing ? 'User updated successfully!' : 'User created successfully!');
        onSuccess();
        onClose();
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to save user';
      toast.error(message);
      console.error('Error saving user:', err.response?.data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-[#14141f]">
            {isEditing ? 'Edit User' : 'Add New User'}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-[#6b6b84] hover:text-[#1e1e2a] transition"
          >
            <i className="fas fa-times text-xl"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#2d2d3f] mb-1.5">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="John Doe"
              className="w-full px-4 py-2.5 rounded-xl border border-[#e6e6ed] bg-[#faf9f6] focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#2d2d3f] mb-1.5">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="user@example.com"
              className="w-full px-4 py-2.5 rounded-xl border border-[#e6e6ed] bg-[#faf9f6] focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#2d2d3f] mb-1.5">
              Password {!isEditing && <span className="text-red-500">*</span>}
              {isEditing && <span className="text-xs text-[#6b6b84]"> (Leave blank to keep current)</span>}
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder={isEditing ? '••••••••' : 'Enter password'}
              className="w-full px-4 py-2.5 rounded-xl border border-[#e6e6ed] bg-[#faf9f6] focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition text-sm"
              required={!isEditing}
              minLength={6}
            />
            <p className="text-xs text-[#6b6b84] mt-1">Must be at least 6 characters</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#2d2d3f] mb-1.5">Role</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl border border-[#e6e6ed] bg-[#faf9f6] focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition text-sm"
              >
                <option value="user">User</option>
                <option value="author">Author</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#2d2d3f] mb-1.5">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl border border-[#e6e6ed] bg-[#faf9f6] focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition text-sm"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="pending">Pending</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#2d2d3f] mb-1.5">Bio</label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              rows="3"
              placeholder="Tell us about this user..."
              className="w-full px-4 py-2.5 rounded-xl border border-[#e6e6ed] bg-[#faf9f6] focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#2d2d3f] mb-1.5">Location</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="New York, USA"
              className="w-full px-4 py-2.5 rounded-xl border border-[#e6e6ed] bg-[#faf9f6] focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition text-sm"
            />
          </div>

          <div className="flex gap-3 mt-6 pt-4 border-t border-[#e6e6ed]">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-xl border border-[#e6e6ed] hover:bg-[#faf9f6] transition text-sm font-medium text-[#2d2d3f]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white transition text-sm font-medium disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Saving...
                </>
              ) : (
                <>
                  <i className="fas fa-save"></i>
                  {isEditing ? 'Update User' : 'Create User'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserForm;