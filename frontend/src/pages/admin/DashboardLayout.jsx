import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import DashboardSidebar from '../../components/dashboard/DashboardSidebar';
import MobileSidebar from '../../components/dashboard/MobileSidebar';

const DashboardLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Desktop Sidebar */}
      <DashboardSidebar />

      {/* Mobile Sidebar */}
      <MobileSidebar isOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Mobile Menu Toggle - Only visible on mobile */}
        <div className="md:hidden sticky top-0 z-10 bg-[#faf9f6] px-4 py-3 flex items-center justify-between border-b border-[#e6e6ed]">
          <button 
            className="text-[#2d2d3f] hover:text-indigo-600 transition p-1"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            <i className="fas fa-bars text-xl"></i>
          </button>
          <span className="text-lg font-bold text-[#1e1e2a]">Blogster</span>
          <div className="w-8"></div> {/* Spacer for centering the title */}
        </div>

        {/* Page Content - Pages handle their own padding */}
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;