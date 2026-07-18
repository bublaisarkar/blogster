import { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import axios from '../api/axios';

const Navbar = () => {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated, isAdmin } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // ✅ Ref for dropdown timeout
  const dropdownTimeoutRef = useRef(null);
  const profileDropdownTimeoutRef = useRef(null);

  // ✅ Fetch categories from backend
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get('/categories');
        if (data.success) {
          setCategories(data.data || []);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  // ✅ Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (dropdownTimeoutRef.current) {
        clearTimeout(dropdownTimeoutRef.current);
      }
      if (profileDropdownTimeoutRef.current) {
        clearTimeout(profileDropdownTimeoutRef.current);
      }
    };
  }, []);

  const navLinkClass = ({ isActive }) =>
    `hover:text-indigo-600 transition ${isActive ? 'text-indigo-600' : 'text-[#2d2d3f]'}`;

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileOpen(false);
    setProfileDropdownOpen(false);
  };

  // ✅ Category dropdown handlers with delay
  const handleCategoryMouseEnter = () => {
    if (dropdownTimeoutRef.current) {
      clearTimeout(dropdownTimeoutRef.current);
      dropdownTimeoutRef.current = null;
    }
    setDropdownOpen(true);
  };

  const handleCategoryMouseLeave = () => {
    dropdownTimeoutRef.current = setTimeout(() => {
      setDropdownOpen(false);
      dropdownTimeoutRef.current = null;
    }, 300); // ✅ 300ms delay before closing
  };

  // ✅ Profile dropdown handlers with delay
  const handleProfileMouseEnter = () => {
    if (profileDropdownTimeoutRef.current) {
      clearTimeout(profileDropdownTimeoutRef.current);
      profileDropdownTimeoutRef.current = null;
    }
    setProfileDropdownOpen(true);
  };

  const handleProfileMouseLeave = () => {
    profileDropdownTimeoutRef.current = setTimeout(() => {
      setProfileDropdownOpen(false);
      profileDropdownTimeoutRef.current = null;
    }, 300); // ✅ 300ms delay before closing
  };

  // ✅ Toggle profile dropdown on click (for mobile)
  const toggleProfileDropdown = () => {
    setProfileDropdownOpen(!profileDropdownOpen);
  };

  return (
    <nav className="flex flex-wrap items-center justify-between py-3 border-b border-[#e6e6ed] bg-white/80 backdrop-blur-sm rounded-2xl px-4 sm:px-5 mt-3 shadow-sm relative z-50">
      {/* Logo */}
      <Link to="/" className="flex items-center space-x-2 text-xl sm:text-2xl font-bold tracking-tight text-[#1e1e2a]">
        <i className="fas fa-pen-fancy text-indigo-600"></i>
        <span>Blogster</span>
      </Link>
      
      {/* Mobile menu toggle */}
      <button 
        className="block md:hidden text-[#2d2d3f] hover:text-indigo-600 transition"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        <i className="fas fa-bars text-xl"></i>
      </button>

      {/* Desktop nav items */}
      <div className="hidden md:flex items-center gap-6 text-sm font-medium text-[#2d2d3f]">
        <NavLink to="/" className={navLinkClass}>Home</NavLink>
        <NavLink to="/articles" className={navLinkClass}>Articles</NavLink>
        
        {/* ✅ Categories Dropdown - With delay on close */}
        <div 
          className="relative"
          onMouseEnter={handleCategoryMouseEnter}
          onMouseLeave={handleCategoryMouseLeave}
        >
          <button className="hover:text-indigo-600 transition flex items-center gap-1">
            Categories <i className="fas fa-chevron-down text-xs"></i>
          </button>
          {dropdownOpen && (
            <div 
              className="absolute top-full left-0 mt-2 bg-white rounded-xl shadow-lg border border-[#e6e6ed] py-2 min-w-[180px] z-50 max-h-80 overflow-y-auto"
              onMouseEnter={handleCategoryMouseEnter}
              onMouseLeave={handleCategoryMouseLeave}
            >
              {loading ? (
                <div className="px-4 py-2 text-sm text-[#6b6b84]">Loading...</div>
              ) : categories.length > 0 ? (
                categories.map((category) => (
                  <NavLink
                    key={category._id}
                    to={`/category/${category.slug || category._id}`}
                    className={({ isActive }) =>
                      `block px-4 py-2 hover:bg-[#f0eff5] text-sm transition ${
                        isActive ? 'text-indigo-600 bg-[#f0eff5]' : 'text-[#2d2d3f]'
                      }`
                    }
                    onClick={() => setDropdownOpen(false)}
                  >
                    <span className="flex items-center gap-2">
                      <span 
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ backgroundColor: category.color || '#6366f1' }}
                      />
                      {category.name}
                    </span>
                  </NavLink>
                ))
              ) : (
                <div className="px-4 py-2 text-sm text-[#6b6b84]">No categories</div>
              )}
            </div>
          )}
        </div>
        
        <NavLink to="/about" className={navLinkClass}>About</NavLink>
        <NavLink to="/contact" className={navLinkClass}>Contact</NavLink>
      </div>

      {/* Desktop right actions */}
      <div className="hidden md:flex items-center gap-2 lg:gap-3">
        <NavLink to="/search" className="text-sm font-medium text-[#2d2d3f] hover:bg-[#f0eff5] px-3 py-2 rounded-full transition">
          <i className="fas fa-search"></i>
        </NavLink>

        {/* Show different buttons based on auth status */}
        {isAuthenticated ? (
          <div 
            className="relative"
            onMouseEnter={handleProfileMouseEnter}
            onMouseLeave={handleProfileMouseLeave}
          >
            <button
              onClick={toggleProfileDropdown}
              className="flex items-center gap-2 text-sm font-medium text-[#2d2d3f] hover:text-indigo-600 transition px-3 py-2 rounded-full hover:bg-[#f0eff5]"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-white text-sm font-semibold">
                {user?.avatar ? (
                  <img 
                    src={user.avatar} 
                    alt={user.name || 'User'} 
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <i className="fas fa-user text-white text-sm"></i>
                )}
              </div>
              <span className="hidden lg:inline">{user?.name || 'Profile'}</span>
              <i className="fas fa-chevron-down text-xs"></i>
            </button>

            {/* Profile Dropdown */}
            {profileDropdownOpen && (
              <div 
                className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-[#e6e6ed] py-2 z-[999]"
                onMouseEnter={handleProfileMouseEnter}
                onMouseLeave={handleProfileMouseLeave}
              >
                <NavLink 
                  to="/profile" 
                  className="px-4 py-2 hover:bg-[#f0eff5] text-sm flex items-center gap-2"
                  onClick={() => setProfileDropdownOpen(false)}
                >
                  <i className="fas fa-user-circle w-5 text-indigo-600"></i> My Profile
                </NavLink>

                {isAdmin && (
                  <NavLink 
                    to="/dashboard" 
                    className="px-4 py-2 hover:bg-[#f0eff5] text-sm flex items-center gap-2"
                    onClick={() => setProfileDropdownOpen(false)}
                  >
                    <i className="fas fa-chart-pie w-5 text-indigo-600"></i> Admin Dashboard
                  </NavLink>
                )}

                <div className="border-t border-[#e6e6ed] my-1"></div>

                <button 
                  onClick={() => {
                    handleLogout();
                    setProfileDropdownOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-[#f0eff5] text-sm text-red-600 flex items-center gap-2"
                >
                  <i className="fas fa-sign-out-alt w-5"></i> Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <>
            <NavLink to="/login" className="text-sm font-medium text-[#2d2d3f] hover:bg-[#f0eff5] px-4 py-2 rounded-full transition">
              <i className="fas fa-user mr-1"></i> Login
            </NavLink>
            <NavLink to="/register" className="text-sm font-medium bg-[#1e1e2a] text-white px-5 py-2 rounded-full hover:bg-[#3a3a52] transition shadow-sm">
              <i className="fas fa-user-plus mr-1"></i> Sign Up
            </NavLink>
          </>
        )}
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="w-full md:hidden mt-3 pt-3 border-t border-[#e6e6ed] relative z-50 bg-white rounded-xl shadow-lg">
          <div className="flex flex-col gap-2 p-4 max-h-[80vh] overflow-y-auto">
            <NavLink to="/" className="text-sm font-medium text-[#2d2d3f] hover:bg-[#f0eff5] px-3 py-2 rounded-lg transition" onClick={() => setMobileOpen(false)}>Home</NavLink>
            <NavLink to="/articles" className="text-sm font-medium text-[#2d2d3f] hover:bg-[#f0eff5] px-3 py-2 rounded-lg transition" onClick={() => setMobileOpen(false)}>Articles</NavLink>
            
            {/* Mobile Categories */}
            <div className="px-3 py-1">
              <p className="text-xs font-semibold text-[#6b6b84] uppercase tracking-wider mb-1">Categories</p>
              <div className="flex flex-col gap-0.5">
                {loading ? (
                  <div className="text-sm text-[#6b6b84] py-1">Loading...</div>
                ) : categories.length > 0 ? (
                  categories.map((category) => (
                    <NavLink
                      key={category._id}
                      to={`/category/${category.slug || category._id}`}
                      className={({ isActive }) =>
                        `text-sm px-2 py-1.5 rounded-lg transition ${
                          isActive ? 'text-indigo-600 bg-[#f0eff5]' : 'text-[#2d2d3f] hover:bg-[#f0eff5]'
                        }`
                      }
                      onClick={() => setMobileOpen(false)}
                    >
                      <span className="flex items-center gap-2">
                        <span 
                          className="w-2 h-2 rounded-full flex-shrink-0"
                          style={{ backgroundColor: category.color || '#6366f1' }}
                        />
                        {category.name}
                      </span>
                    </NavLink>
                  ))
                ) : (
                  <div className="text-sm text-[#6b6b84] py-1">No categories</div>
                )}
              </div>
            </div>

            <NavLink to="/about" className="text-sm font-medium text-[#2d2d3f] hover:bg-[#f0eff5] px-3 py-2 rounded-lg transition" onClick={() => setMobileOpen(false)}>About</NavLink>
            <NavLink to="/contact" className="text-sm font-medium text-[#2d2d3f] hover:bg-[#f0eff5] px-3 py-2 rounded-lg transition" onClick={() => setMobileOpen(false)}>Contact</NavLink>
            
            <div className="flex flex-col gap-2 mt-2 pt-2 border-t border-[#e6e6ed]">
              <NavLink to="/search" className="text-sm font-medium text-[#2d2d3f] hover:bg-[#f0eff5] px-3 py-2 rounded-lg transition" onClick={() => setMobileOpen(false)}>
                <i className="fas fa-search mr-2"></i>Search
              </NavLink>

              {isAuthenticated ? (
                <>
                  <div className="flex items-center gap-3 px-3 py-2 border-b border-[#e6e6ed] mb-1">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-white">
                      {user?.avatar ? (
                        <img 
                          src={user.avatar} 
                          alt={user.name || 'User'} 
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <i className="fas fa-user text-sm"></i>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#1e1e2a]">{user?.name || 'User'}</p>
                      <p className="text-xs text-[#6b6b84] capitalize">{user?.role || 'User'}</p>
                    </div>
                  </div>

                  <NavLink to="/profile" className="text-sm font-medium text-[#2d2d3f] hover:bg-[#f0eff5] px-3 py-2 rounded-lg transition" onClick={() => setMobileOpen(false)}>
                    <i className="fas fa-user-circle mr-2 w-5 text-indigo-600"></i> My Profile
                  </NavLink>
                  
                  {isAdmin && (
                    <NavLink to="/dashboard" className="text-sm font-medium text-[#2d2d3f] hover:bg-[#f0eff5] px-3 py-2 rounded-lg transition" onClick={() => setMobileOpen(false)}>
                      <i className="fas fa-chart-pie mr-2 w-5 text-indigo-600"></i> Admin Dashboard
                    </NavLink>
                  )}

                  <button 
                    onClick={handleLogout}
                    className="text-sm font-medium text-red-600 hover:bg-red-50 px-3 py-2 rounded-lg transition text-left"
                  >
                    <i className="fas fa-sign-out-alt mr-2 w-5"></i> Logout
                  </button>
                </>
              ) : (
                <>
                  <NavLink to="/login" className="text-sm font-medium text-[#2d2d3f] hover:bg-[#f0eff5] px-3 py-2 rounded-lg transition" onClick={() => setMobileOpen(false)}>
                    <i className="fas fa-user mr-2 w-5"></i>Login
                  </NavLink>
                  <NavLink to="/register" className="text-sm font-medium bg-[#1e1e2a] text-white px-4 py-2 rounded-lg hover:bg-[#3a3a52] transition text-center" onClick={() => setMobileOpen(false)}>
                    <i className="fas fa-user-plus mr-2"></i>Sign Up
                  </NavLink>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;