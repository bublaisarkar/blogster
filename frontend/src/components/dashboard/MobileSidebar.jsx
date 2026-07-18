import { NavLink, Link } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';

const MobileSidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();

  if (!isOpen) return null;

  // ✅ Only show if user is admin
  if (user?.role !== 'admin') {
    return null;
  }

  const navItems = [
    { to: '/dashboard', icon: 'fa-chart-pie', label: 'Dashboard' },
    { to: '/dashboard/add-blog', icon: 'fa-plus-circle', label: 'Add Blog' },
    { to: '/dashboard/blog-lists', icon: 'fa-list-ul', label: 'Blog Lists' },
    { to: '/dashboard/comments', icon: 'fa-comments', label: 'Comments' },
    { to: '/dashboard/users', icon: 'fa-users', label: 'Users' },
    { to: '/dashboard/settings', icon: 'fa-cog', label: 'Settings' }
  ];

  // ✅ Handle logout
  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
      onClose(); // Close sidebar after logout
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-40 md:hidden"
        onClick={onClose}
      />
      
      {/* Sidebar */}
      <div className="fixed top-0 left-0 h-full w-64 bg-white z-50 shadow-xl md:hidden overflow-y-auto">
        {/* Logo with Home Link and Close Button */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#e6e6ed]">
          <Link 
            to="/" 
            onClick={onClose}
            className="flex items-center space-x-2 text-xl font-bold tracking-tight text-[#1e1e2a] hover:text-indigo-600 transition group"
          >
            <i className="fas fa-pen-fancy text-indigo-600 group-hover:scale-110 transition-transform"></i>
            <span>Blogster</span>
          </Link>
          <button 
            onClick={onClose}
            className="text-[#6b6b84] hover:text-[#1e1e2a] transition p-1"
            aria-label="Close menu"
          >
            <i className="fas fa-times text-xl"></i>
          </button>
        </div>

        {/* Navigation */}
        <nav className="px-4 py-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/dashboard'}
              onClick={onClose}
            >
              {({ isActive }) => (
                <div
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition cursor-pointer ${
                    isActive
                      ? 'bg-indigo-600 text-white'
                      : 'text-[#2d2d3f] hover:bg-[#f0eff5]'
                  }`}
                >
                  <i
                    className={`fas ${item.icon} w-5 text-center ${
                      isActive ? 'text-white' : 'text-[#6b6b84]'
                    }`}
                  ></i>
                  <span>{item.label}</span>
                </div>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User Profile */}
        <div className="border-t border-[#e6e6ed] px-6 py-4">
          <div className="flex items-center gap-3">
            <img 
              src={user?.avatar || 'https://ui-avatars.com/api/?name=User&background=4f46e5&color=fff'} 
              alt={user?.name || 'User'} 
              className="w-10 h-10 rounded-full object-cover" 
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[#1e1e2a] truncate">{user?.name || 'User'}</p>
              <p className="text-xs text-[#6b6b84] truncate capitalize">{user?.role || 'User'}</p>
            </div>
            <button 
              onClick={handleLogout}
              className="text-[#6b6b84] hover:text-red-600 transition" 
              title="Logout"
            >
              <i className="fas fa-sign-out-alt"></i>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default MobileSidebar;