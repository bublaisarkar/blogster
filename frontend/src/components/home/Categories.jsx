// components/Categories.jsx
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCategory } from '../../hooks/useCategory';

// ✅ Generate fixed widths for skeleton placeholders (runs once outside render)
const SKELETON_WIDTHS = [80, 100, 70, 120, 90, 110];

const Categories = () => {
  const { categories, fetchCategories, loading } = useCategory();

  // ✅ Add fetchCategories as a dependency
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-4 sm:p-6 border border-[#edebf5]">
        <h3 className="text-lg sm:text-xl font-semibold flex items-center gap-2">
          <i className="fas fa-tags text-indigo-600" aria-hidden="true"></i> Categories
        </h3>
        <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-3 sm:mt-4">
          {SKELETON_WIDTHS.map((width, i) => (
            <span 
              key={i}
              className="bg-gray-200 px-3 sm:px-4 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm animate-pulse"
              style={{ width: `${width}px` }}
            >
              &nbsp;
            </span>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-6 border border-[#edebf5]">
      <div className="flex items-center justify-between">
        <h3 className="text-lg sm:text-xl font-semibold flex items-center gap-2">
          <i className="fas fa-tags text-indigo-600" aria-hidden="true"></i> Categories
        </h3>
        <span className="text-xs text-gray-400">{categories.length} total</span>
      </div>
      
      {categories.length === 0 ? (
        <p className="text-sm text-gray-400 mt-3">No categories available</p>
      ) : (
        <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-3 sm:mt-4">
          {categories.map((category) => (
            <Link
              key={category._id}
              to={`/category/${category.slug || category._id}`}
              className="bg-[#f3f1fb] px-3 sm:px-4 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-medium text-[#2c2c44] border border-transparent transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600"
            >
              {category.icon && <span className="mr-1">{category.icon}</span>}
              {category.name}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Categories;