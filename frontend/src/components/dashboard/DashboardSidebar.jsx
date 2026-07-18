import { NavLink, Link } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';

const DashboardSidebar = () => {
  const { user, logout } = useAuth();

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
    }
  };

  return (
    <aside className="hidden md:flex w-64 bg-white border-r border-[#e6e6ed] flex-col flex-shrink-0 h-screen sticky top-0">
      {/* Logo with Home Link */}
      <Link 
        to="/" 
        className="flex items-center space-x-2 text-xl font-bold tracking-tight text-[#1e1e2a] px-6 py-5 border-b border-[#e6e6ed] hover:bg-[#f8f7fc] transition group"
      >
        <i className="fas fa-pen-fancy text-indigo-600 group-hover:scale-110 transition-transform"></i>
        <span className="group-hover:text-indigo-600 transition">Blogster</span>
      </Link>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/dashboard'}
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
    </aside>
  );
};

export default DashboardSidebar;