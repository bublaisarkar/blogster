import { Link } from 'react-router-dom';

const Breadcrumb = ({ title }) => {
  return (
    <div className="flex items-center gap-2 text-sm text-[#6b6b84] mt-6">
      <Link to="/" className="hover:text-indigo-600 transition">Home</Link>
      <i className="fas fa-chevron-right text-xs"></i>
      <Link to="/articles" className="hover:text-indigo-600 transition">Articles</Link>
      <i className="fas fa-chevron-right text-xs"></i>
      <span className="text-[#1e1e2a] font-medium">{title}</span>
    </div>
  );
};

export default Breadcrumb;