import { useState, useEffect, useMemo, useRef } from 'react';
import axios from '../../../api/axios';
import toast from 'react-hot-toast';

const BlogFormFields = ({ 
  title, 
  categories: selectedCategories = [], 
  onTitleChange, 
  onCategoriesChange 
}) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryFormData, setCategoryFormData] = useState({
    name: '',
    slug: ''
  });
  
  const isMounted = useRef(true);

  // ✅ Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get('/categories');
        
        if (isMounted.current && data.success) {
          setCategories(data.data || []);
        } else if (isMounted.current) {
          toast.error(data.message || 'Failed to load categories');
          setCategories([]);
        }
      } catch (err) {
        if (isMounted.current) {
          if (err.response?.status === 404) {
            toast.error('Categories endpoint not found. Please check server configuration.');
          } else if (err.response?.status === 500) {
            toast.error('Server error loading categories. Please try again.');
          } else {
            toast.error(err.response?.data?.message || 'Failed to load categories');
          }
          setCategories([]);
        }
      } finally {
        if (isMounted.current) {
          setLoading(false);
        }
      }
    };

    fetchCategories();

    return () => {
      isMounted.current = false;
    };
  }, []);

  // ✅ Build lookup map using slug and _id
  const categoryMap = useMemo(() => {
    const map = {};
    categories.forEach(c => {
      // Map by slug
      map[c.slug] = c;
      // Also map by _id
      map[c._id] = c;
    });
    return map;
  }, [categories]);

  // ✅ Get category name by slug or _id
  const getCategoryName = (slugOrId) => {
    const cat = categoryMap[slugOrId];
    return cat ? cat.name : slugOrId;
  };

  // ✅ Get category object by slug or _id
  const getCategory = (slugOrId) => {
    return categoryMap[slugOrId] || null;
  };

  // ✅ Add category
  const handleAddCategory = async () => {
    // ✅ Validate inputs
    if (!categoryFormData.name.trim()) {
      toast.error('Please enter a category name');
      return;
    }
    
    if (!categoryFormData.slug.trim()) {
      toast.error('Please enter a category slug');
      return;
    }

    // ✅ Check if category name already exists (case insensitive)
    const nameExists = categories.some(c => 
      c.name.toLowerCase() === categoryFormData.name.trim().toLowerCase()
    );
    
    if (nameExists) {
      toast.error('Category name already exists. Please use a different name.');
      return;
    }

    // ✅ Check if slug already exists
    const slugExists = categories.some(c => 
      c.slug?.toLowerCase() === categoryFormData.slug.trim().toLowerCase()
    );
    
    if (slugExists) {
      toast.error('Category slug already exists. Please use a unique slug.');
      return;
    }

    try {
      const { data } = await axios.post('/categories', {
        name: categoryFormData.name.trim(),
        slug: categoryFormData.slug.trim().toLowerCase()
      });

      if (data.success) {
        setCategories([...categories, data.data]);
        setCategoryFormData({ name: '', slug: '' });
        setShowCategoryModal(false);
        toast.success('Category added successfully!');
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to add category';
      toast.error(message);
    }
  };

  // ✅ Update category
  const handleUpdateCategory = async () => {
    if (!categoryFormData.name.trim() || !categoryFormData.slug.trim()) {
      toast.error('Please enter both category name and slug');
      return;
    }

    // ✅ Check if name conflicts with other categories
    const nameExists = categories.some(c => 
      c._id !== editingCategory._id && 
      c.name.toLowerCase() === categoryFormData.name.trim().toLowerCase()
    );
    
    if (nameExists) {
      toast.error('Category name already exists. Please use a different name.');
      return;
    }

    // ✅ Check if slug conflicts with other categories
    const slugExists = categories.some(c => 
      c._id !== editingCategory._id && 
      c.slug?.toLowerCase() === categoryFormData.slug.trim().toLowerCase()
    );
    
    if (slugExists) {
      toast.error('Category slug already exists. Please use a unique slug.');
      return;
    }

    try {
      const { data } = await axios.put(`/categories/${editingCategory._id}`, {
        name: categoryFormData.name.trim(),
        slug: categoryFormData.slug.trim().toLowerCase()
      });

      if (data.success) {
        setCategories(categories.map(c => 
          c._id === editingCategory._id 
            ? { ...c, name: categoryFormData.name.trim(), slug: categoryFormData.slug.trim().toLowerCase() }
            : c
        ));
        setCategoryFormData({ name: '', slug: '' });
        setEditingCategory(null);
        setShowCategoryModal(false);
        toast.success('Category updated successfully!');
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to update category';
      toast.error(message);
    }
  };

  // ✅ Delete category
  const handleDeleteCategory = async (categoryId) => {
    const categoryToDelete = categories.find(c => c._id === categoryId);
    if (!categoryToDelete) return;

    const slug = categoryToDelete.slug;
    if (selectedCategories.includes(slug)) {
      toast.error(`Cannot delete "${categoryToDelete.name}" as it's currently selected.`);
      return;
    }

    if (!window.confirm(`Are you sure you want to delete "${categoryToDelete.name}" category?`)) {
      return;
    }

    try {
      const { data } = await axios.delete(`/categories/${categoryId}`);
      if (data.success) {
        // Remove from selected if present
        if (selectedCategories.includes(slug)) {
          onCategoriesChange(selectedCategories.filter(c => c !== slug));
        }
        setCategories(categories.filter(c => c._id !== categoryId));
        toast.success('Category deleted successfully!');
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to delete category';
      toast.error(message);
    }
  };

  // ✅ Toggle category selection – always use slug
  const toggleCategory = (categoryId) => {
    const cat = getCategory(categoryId);
    if (!cat) return;
    const slug = cat.slug;
    if (selectedCategories.includes(slug)) {
      onCategoriesChange(selectedCategories.filter(c => c !== slug));
    } else {
      onCategoriesChange([...selectedCategories, slug]);
    }
  };

  // ✅ Remove category from selection
  const removeCategory = (categorySlug) => {
    onCategoriesChange(selectedCategories.filter(c => c !== categorySlug));
  };

  const openAddModal = () => {
    setEditingCategory(null);
    setCategoryFormData({ name: '', slug: '' });
    setShowCategoryModal(true);
    setIsDropdownOpen(false);
  };

  const closeModal = () => {
    setShowCategoryModal(false);
    setEditingCategory(null);
    setCategoryFormData({ name: '', slug: '' });
  };

  const handleEditCategory = (category) => {
    setEditingCategory(category);
    setCategoryFormData({
      name: category.name,
      slug: category.slug || ''
    });
    setShowCategoryModal(true);
  };

  // Loading state
  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-[#edebf5] shadow-sm">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          <span className="ml-3 text-[#6b6b84]">Loading categories...</span>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Title */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-[#edebf5] shadow-sm">
        <label htmlFor="title" className="block text-sm font-semibold text-[#2d2d3f] mb-1.5">
          <i className="fas fa-heading mr-2 text-indigo-500"></i> Blog Title
        </label>
        <input 
          type="text" 
          id="title" 
          name="title"
          value={title}
          onChange={onTitleChange}
          placeholder="Enter your blog title..." 
          className="w-full px-4 py-3 rounded-xl border border-[#e6e6ed] bg-[#faf9f6] focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition text-sm"
          required
        />
      </div>

      {/* Category */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-[#edebf5] shadow-sm">
        <div className="flex items-center justify-between mb-1.5">
          <label className="block text-sm font-semibold text-[#2d2d3f]">
            <i className="fas fa-tags mr-2 text-indigo-500"></i> Categories
          </label>
          <button
            type="button"
            onClick={openAddModal}
            className="text-xs text-indigo-600 hover:text-indigo-800 transition font-medium flex items-center gap-1"
          >
            <i className="fas fa-plus"></i> Add Category
          </button>
        </div>
        
        {/* Multi-select dropdown */}
        <div className="relative">
          <div 
            className="w-full px-4 py-3 rounded-xl border border-[#e6e6ed] bg-[#faf9f6] cursor-pointer transition hover:border-indigo-400 min-h-[52px] flex flex-wrap items-center gap-1.5"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setIsDropdownOpen(!isDropdownOpen);
              }
            }}
          >
            {selectedCategories.length > 0 ? (
              selectedCategories.map((catSlug) => (
                <span
                  key={catSlug}
                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium"
                >
                  {getCategoryName(catSlug)}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeCategory(catSlug);
                    }}
                    className="hover:text-indigo-900 transition"
                    aria-label={`Remove ${getCategoryName(catSlug)}`}
                  >
                    <i className="fas fa-times text-xs"></i>
                  </button>
                </span>
              ))
            ) : (
              <span className="text-[#908db0] text-sm">Select categories...</span>
            )}
            <i className={`fas fa-chevron-down ml-auto text-[#908db0] transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}></i>
          </div>

          {/* Dropdown options */}
          {isDropdownOpen && (
            <div className="absolute z-10 w-full mt-1 bg-white rounded-xl border border-[#e6e6ed] shadow-lg max-h-48 overflow-y-auto">
              {categories.length > 0 ? (
                categories.map((cat) => (
                  <div
                    key={cat._id}
                    className="flex items-center gap-2 px-4 py-2.5 hover:bg-[#f0eff5] transition cursor-pointer"
                    onClick={() => toggleCategory(cat._id)}
                    role="option"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        toggleCategory(cat._id);
                      }
                    }}
                    aria-selected={selectedCategories.includes(cat.slug)}
                  >
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(cat.slug)}
                      onChange={() => {}}
                      className="w-4 h-4 rounded border-[#e6e6ed] text-indigo-600 focus:ring-indigo-500"
                      aria-label={`Select ${cat.name}`}
                    />
                    <span className="text-sm text-[#2d2d3f]">{cat.name}</span>
                  </div>
                ))
              ) : (
                <div className="px-4 py-3 text-center text-sm text-[#6b6b84]">
                  No categories available. Add one!
                </div>
              )}
              <div className="border-t border-[#e6e6ed] p-2">
                <button
                  type="button"
                  onClick={() => setIsDropdownOpen(false)}
                  className="w-full text-center text-sm text-[#6b6b84] hover:text-[#2d2d3f] transition"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Category Management Tags */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          <span className="text-xs text-[#6b6b84] mr-1">Manage:</span>
          {categories.map((cat) => {
            const isSelected = selectedCategories.includes(cat.slug);
            return (
              <span
                key={cat._id}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                  isSelected 
                    ? 'bg-indigo-100 text-indigo-700' 
                    : 'bg-[#f3f1fb] text-[#2c2c44]'
                }`}
              >
                {cat.name}
                <button
                  type="button"
                  onClick={() => handleEditCategory(cat)}
                  className={`hover:text-indigo-600 transition ${isSelected ? 'text-indigo-500' : 'text-[#6b6b84]'}`}
                  title="Edit category"
                  aria-label={`Edit ${cat.name}`}
                >
                  <i className="fas fa-edit text-xs"></i>
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteCategory(cat._id)}
                  className={`hover:text-red-600 transition ${isSelected ? 'text-indigo-400' : 'text-[#6b6b84]'}`}
                  title="Delete category"
                  aria-label={`Delete ${cat.name}`}
                >
                  <i className="fas fa-times text-xs"></i>
                </button>
              </span>
            );
          })}
        </div>
      </div>

      {/* Category Modal */}
      {showCategoryModal && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="category-modal-title"
        >
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 id="category-modal-title" className="text-xl font-bold text-[#14141f]">
                {editingCategory ? 'Edit Category' : 'Add New Category'}
              </h3>
              <button
                type="button"
                onClick={closeModal}
                className="text-[#6b6b84] hover:text-[#1e1e2a] transition"
                aria-label="Close modal"
              >
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="category-name" className="block text-sm font-medium text-[#2d2d3f] mb-1.5">
                  Category Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="category-name"
                  type="text"
                  value={categoryFormData.name}
                  onChange={(e) => setCategoryFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Technology"
                  className="w-full px-4 py-2.5 rounded-xl border border-[#e6e6ed] bg-[#faf9f6] focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition text-sm"
                  required
                />
              </div>
              <div>
                <label htmlFor="category-slug" className="block text-sm font-medium text-[#2d2d3f] mb-1.5">
                  Category Slug <span className="text-red-500">*</span>
                </label>
                <input
                  id="category-slug"
                  type="text"
                  value={categoryFormData.slug}
                  onChange={(e) => setCategoryFormData(prev => ({ ...prev, slug: e.target.value.toLowerCase() }))}
                  placeholder="e.g., technology"
                  className="w-full px-4 py-2.5 rounded-xl border border-[#e6e6ed] bg-[#faf9f6] focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition text-sm"
                  required
                />
                <p className="text-xs text-[#6b6b84] mt-1">Used as a unique identifier (lowercase, no spaces, use hyphens)</p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={closeModal}
                className="flex-1 px-4 py-2.5 rounded-xl border border-[#e6e6ed] hover:bg-[#faf9f6] transition text-sm font-medium text-[#2d2d3f]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={editingCategory ? handleUpdateCategory : handleAddCategory}
                className="flex-1 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white transition text-sm font-medium"
              >
                {editingCategory ? 'Update Category' : 'Add Category'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BlogFormFields;