import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import SettingsInput from './SettingsInput';
import SettingsButton from './SettingsButton';
import ToggleSwitch from './ToggleSwitch';
import axios from '../../../api/axios';

const BlogTab = ({ data, onChange, onSubmit, loading = false }) => {
  const [errors, setErrors] = useState({});
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [categories, setCategories] = useState([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [blogStats, setBlogStats] = useState({
    totalPosts: 0,
    totalComments: 0,
    totalViews: 0
  });

  // Fetch blog categories from backend
  useEffect(() => {
    const fetchCategories = async () => {
      setIsLoadingCategories(true);
      try {
        const { data } = await axios.get('/blog/categories');
        if (data.success) {
          setCategories(data.data);
        }
      } catch {
        // Fallback to default categories
        setCategories([
          { id: '1', name: 'Technology', slug: 'technology' },
          { id: '2', name: 'AI', slug: 'ai' },
          { id: '3', name: 'Design', slug: 'design' },
          { id: '4', name: 'Productivity', slug: 'productivity' },
          { id: '5', name: 'Culture', slug: 'culture' },
          { id: '6', name: 'Health', slug: 'health' },
          { id: '7', name: 'Business', slug: 'business' },
          { id: '8', name: 'Education', slug: 'education' }
        ]);
      } finally {
        setIsLoadingCategories(false);
      }
    };
    fetchCategories();
  }, []);

  // Fetch blog stats from backend
  useEffect(() => {
    const fetchBlogStats = async () => {
      try {
        const { data } = await axios.get('/blog/stats');
        if (data.success) {
          setBlogStats(data.data);
        }
      } catch {
        // Silent fail for stats
      }
    };
    fetchBlogStats();
  }, []);

  // Validation function
  const validateField = (name, value) => {
    switch (name) {
      case 'blogTitle':
        if (!value.trim()) return 'Blog title is required';
        if (value.trim().length < 3) return 'Blog title must be at least 3 characters';
        if (value.trim().length > 100) return 'Blog title must be less than 100 characters';
        return '';
      case 'tagline':
        if (value.trim().length > 200) return 'Tagline must be less than 200 characters';
        return '';
      case 'postsPerPage': {
        const num = parseInt(value, 10);
        if (isNaN(num) || num < 1) return 'Must be at least 1 post per page';
        if (num > 50) return 'Must be less than 50 posts per page';
        return '';
      }
      default:
        return '';
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    const error = validateField(name, newValue);
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
    
    setIsDirty(true);
    onChange(e);
  };

  // Direct API call for saving blog settings
  const saveBlogSettings = async (settingsData) => {
    setIsSaving(true);
    
    try {
      const { data } = await axios.put('/blog/settings', {
        blogTitle: settingsData.blogTitle,
        tagline: settingsData.tagline,
        defaultCategory: settingsData.defaultCategory,
        postsPerPage: parseInt(settingsData.postsPerPage, 10),
        commentModeration: settingsData.commentModeration,
        allowSearchEngines: settingsData.allowSearchEngines
      });

      if (data.success) {
        toast.success('Blog settings saved successfully!');
        // Save to localStorage as backup
        localStorage.setItem('blogSettings', JSON.stringify(settingsData));
        setIsDirty(false);
        return true;
      } else {
        throw new Error(data.message || 'Failed to save settings');
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to save blog settings';
      toast.error(message);
      
      // Still save to localStorage as fallback
      localStorage.setItem('blogSettings', JSON.stringify(settingsData));
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate all fields
    const newErrors = {};
    let hasError = false;
    
    Object.keys(data).forEach(key => {
      const error = validateField(key, data[key]);
      if (error) {
        newErrors[key] = error;
        hasError = true;
      }
    });
    
    setErrors(newErrors);
    
    if (!hasError) {
      const success = await saveBlogSettings(data);
      if (success && onSubmit) {
        onSubmit(e);
      }
    }
  };

  // Handle auto-save
  useEffect(() => {
    if (isDirty) {
      const timer = setTimeout(async () => {
        // Only auto-save if there are no errors
        const hasErrors = Object.values(errors).some(error => error !== '');
        if (!hasErrors) {
          await saveBlogSettings(data);
        }
      }, 5000); // Auto-save after 5 seconds of inactivity
      
      return () => clearTimeout(timer);
    }
  }, [data, isDirty, errors]);

  const handleReset = async () => {
    if (window.confirm('Are you sure you want to reset all changes?')) {
      try {
        // Fetch latest settings from backend
        const { data } = await axios.get('/blog/settings');
        if (data.success) {
          const settings = data.data;
          const resetData = {
            blogTitle: settings.blogTitle || '',
            tagline: settings.tagline || '',
            defaultCategory: settings.defaultCategory || 'AI',
            postsPerPage: settings.postsPerPage?.toString() || '10',
            commentModeration: settings.commentModeration || 'auto-approve',
            allowSearchEngines: settings.allowSearchEngines !== undefined ? settings.allowSearchEngines : true
          };
          
          // Update parent component
          Object.keys(resetData).forEach(key => {
            const event = {
              target: {
                name: key,
                value: resetData[key],
                type: typeof resetData[key] === 'boolean' ? 'checkbox' : 'text'
              }
            };
            onChange(event);
          });
          
          setIsDirty(false);
          setErrors({});
          toast.success('Settings reset to last saved version');
        }
      } catch {
        toast.error('Failed to reset settings');
      }
    }
  };

  // Export settings as JSON
  const handleExportSettings = async () => {
    try {
      const { data } = await axios.get('/blog/settings');
      if (data.success) {
        const blob = new Blob([JSON.stringify(data.data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `blog-settings-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success('Settings exported successfully!');
      }
    } catch {
      toast.error('Failed to export settings');
    }
  };

  // Import settings from JSON
  const handleImportSettings = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const settings = JSON.parse(event.target.result);
          
          // Validate imported data
          const requiredFields = ['blogTitle', 'tagline', 'defaultCategory', 'postsPerPage', 'commentModeration'];
          const isValid = requiredFields.every(field => settings[field] !== undefined);
          
          if (!isValid) {
            toast.error('Invalid settings file format');
            return;
          }

          // Update parent component with imported settings
          Object.keys(settings).forEach(key => {
            const event = {
              target: {
                name: key,
                value: settings[key],
                type: typeof settings[key] === 'boolean' ? 'checkbox' : 'text'
              }
            };
            onChange(event);
          });
          
          setIsDirty(true);
          toast.success('Settings imported successfully! Please save to apply changes.');
        } catch {
          toast.error('Failed to parse settings file');
        }
      };
      reader.readAsText(file);
    } catch {
      toast.error('Failed to import settings');
    }
  };

  const categoryOptions = categories.map(cat => ({
    value: cat.name,
    label: cat.name
  }));

  const postsPerPageOptions = [5, 10, 15, 20, 25, 30, 50];

  const moderationOptions = [
    { value: 'auto-approve', label: 'Auto-approve all comments' },
    { value: 'manual', label: 'Manual approval required' },
    { value: 'disable', label: 'Disable comments' }
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-[#14141f]">Blog Settings</h2>
          <p className="text-sm text-[#6b6b84] mt-1">
            Configure your blog preferences and SEO settings
          </p>
        </div>
        <div className="flex items-center gap-3">
          {isDirty && (
            <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full animate-pulse">
              Unsaved changes
            </span>
          )}
          {isSaving && (
            <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
              <i className="fas fa-spinner fa-spin mr-1"></i> Saving...
            </span>
          )}
        </div>
      </div>

      {/* Blog Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 rounded-xl">
        <div>
          <p className="text-xs text-[#6b6b84]">Total Posts</p>
          <p className="text-lg font-semibold text-[#14141f]">{blogStats.totalPosts}</p>
        </div>
        <div>
          <p className="text-xs text-[#6b6b84]">Total Comments</p>
          <p className="text-lg font-semibold text-[#14141f]">{blogStats.totalComments}</p>
        </div>
        <div>
          <p className="text-xs text-[#6b6b84]">Total Views</p>
          <p className="text-lg font-semibold text-[#14141f]">{blogStats.totalViews}</p>
        </div>
      </div>

      <form className="space-y-5" onSubmit={handleSubmit}>
        <SettingsInput 
          label="Blog Title" 
          name="blogTitle"
          value={data.blogTitle}
          onChange={handleChange}
          placeholder="Enter your blog title"
          error={errors.blogTitle}
          required
          disabled={isSaving || loading}
        />

        <SettingsInput 
          label="Tagline" 
          name="tagline"
          value={data.tagline}
          onChange={handleChange}
          placeholder="A short description of your blog"
          error={errors.tagline}
          helperText={`${data.tagline?.length || 0}/200 characters`}
          disabled={isSaving || loading}
        />

        <div>
          <label className="block text-sm font-medium text-[#2d2d3f] mb-1.5">
            Default Category
            <span className="text-xs text-[#6b6b84] ml-1">(for new posts)</span>
          </label>
          <select 
            name="defaultCategory"
            value={data.defaultCategory}
            onChange={handleChange}
            className="w-full px-4 py-2.5 rounded-xl border border-[#e6e6ed] bg-[#faf9f6] focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition text-sm"
            disabled={isSaving || loading || isLoadingCategories}
          >
            {isLoadingCategories ? (
              <option>Loading categories...</option>
            ) : (
              categoryOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))
            )}
          </select>
          <p className="mt-1 text-xs text-[#6b6b84]">
            This category will be selected by default when creating new posts
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-[#2d2d3f] mb-1.5">
            Posts Per Page
          </label>
          <select 
            name="postsPerPage"
            value={data.postsPerPage}
            onChange={handleChange}
            className={`w-full px-4 py-2.5 rounded-xl border ${
              errors.postsPerPage ? 'border-red-500' : 'border-[#e6e6ed]'
            } bg-[#faf9f6] focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition text-sm`}
            disabled={isSaving || loading}
          >
            {postsPerPageOptions.map(num => (
              <option key={num} value={num.toString()}>
                {num} posts
              </option>
            ))}
          </select>
          {errors.postsPerPage && (
            <p className="mt-1 text-xs text-red-500">{errors.postsPerPage}</p>
          )}
          <p className="mt-1 text-xs text-[#6b6b84]">
            Number of posts to display on the blog listing page
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-[#2d2d3f] mb-1.5">
            Comment Moderation
          </label>
          <select 
            name="commentModeration"
            value={data.commentModeration}
            onChange={handleChange}
            className="w-full px-4 py-2.5 rounded-xl border border-[#e6e6ed] bg-[#faf9f6] focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition text-sm"
            disabled={isSaving || loading}
          >
            {moderationOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-[#6b6b84]">
            {data.commentModeration === 'auto-approve' && 'All comments will be published immediately'}
            {data.commentModeration === 'manual' && 'Comments require admin approval before publishing'}
            {data.commentModeration === 'disable' && 'Comments are disabled on all posts'}
          </p>
        </div>

        <div className="pt-2">
          <ToggleSwitch 
            checked={data.allowSearchEngines}
            onChange={(checked) => {
              const event = {
                target: { 
                  name: 'allowSearchEngines', 
                  value: checked, 
                  type: 'checkbox' 
                }
              };
              handleChange(event);
            }}
            label="Allow Search Engines"
            description="Allow search engines to index your blog and improve SEO"
            disabled={isSaving || loading}
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-[#edebf5]">
          <SettingsButton type="submit" loading={isSaving || loading}>
            <i className="fas fa-save mr-2"></i> 
            {isSaving || loading ? 'Saving...' : 'Save Blog Settings'}
          </SettingsButton>
          
          {isDirty && (
            <button
              type="button"
              onClick={handleReset}
              className="px-4 py-2 text-sm text-[#6b6b84] hover:text-[#14141f] transition-colors"
              disabled={isSaving || loading}
            >
              <i className="fas fa-undo mr-1"></i> Reset
            </button>
          )}

          <div className="flex-1" />

          {/* Import/Export buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportSettings}
              className="px-3 py-2 text-sm text-[#6b6b84] hover:text-[#14141f] transition-colors"
              disabled={isSaving || loading}
            >
              <i className="fas fa-download mr-1"></i> Export
            </button>
            
            <label className="px-3 py-2 text-sm text-[#6b6b84] hover:text-[#14141f] transition-colors cursor-pointer">
              <i className="fas fa-upload mr-1"></i> Import
              <input
                type="file"
                accept=".json"
                onChange={handleImportSettings}
                className="hidden"
                disabled={isSaving || loading}
              />
            </label>
          </div>
        </div>

        {/* Auto-save indicator */}
        <div className="text-xs text-[#6b6b84] text-center">
          {isDirty && !isSaving && 'Changes will be auto-saved in 5 seconds'}
          {isSaving && 'Auto-saving...'}
        </div>
      </form>
    </div>
  );
};

export default BlogTab;