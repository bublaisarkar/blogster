import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#f4f2fa] rounded-t-2xl sm:rounded-t-3xl px-4 sm:px-6 py-6 sm:py-8 mt-6 sm:mt-8">
      <div className="flex flex-wrap items-center justify-between gap-3 sm:gap-4">
        {/* Logo */}
        <div className="flex items-center space-x-2 text-lg sm:text-xl font-bold text-[#1e1e2a]">
          <i className="fas fa-pen-fancy text-indigo-600"></i>
          <span>Blogster</span>
        </div>

        {/* Footer Links */}
        <div className="flex flex-wrap gap-3 sm:gap-6 text-xs sm:text-sm font-medium text-[#3e3e58]">
          <Link to="/about" className="hover:text-[#1e1e2a] transition">About</Link>
          <Link to="/privacy" className="hover:text-[#1e1e2a] transition">Privacy</Link>
          <Link to="/terms" className="hover:text-[#1e1e2a] transition">Terms</Link>
          <Link to="/contact" className="hover:text-[#1e1e2a] transition">Contact</Link>
          <Link to="/advertise" className="hover:text-[#1e1e2a] transition">Advertise</Link>
        </div>

        {/* Social Icons */}
        <div className="flex gap-2 sm:gap-3 text-[#4a4a66] text-base sm:text-lg">
          <a 
            href="#" 
            className="hover:text-indigo-600 transition cursor-pointer"
            aria-label="Twitter"
          >
            <i className="fab fa-twitter"></i>
          </a>
          <a 
            href="#" 
            className="hover:text-indigo-600 transition cursor-pointer"
            aria-label="GitHub"
          >
            <i className="fab fa-github"></i>
          </a>
          <a 
            href="#" 
            className="hover:text-indigo-600 transition cursor-pointer"
            aria-label="LinkedIn"
          >
            <i className="fab fa-linkedin-in"></i>
          </a>
          <a 
            href="#" 
            className="hover:text-indigo-600 transition cursor-pointer"
            aria-label="YouTube"
          >
            <i className="fab fa-youtube"></i>
          </a>
        </div>
      </div>

      {/* Copyright */}
      <div className="text-center text-xs text-[#5f5d78] border-t border-[#e2def0] pt-4 sm:pt-5 mt-4 sm:mt-5">
        &copy; {currentYear} Blogster · crafted with <i className="fas fa-heart text-rose-400 mx-1"></i> for readers
      </div>
    </footer>
  );
};

export default Footer;