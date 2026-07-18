import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import toast from 'react-hot-toast';
import axios from '../../api/axios';
import useBlog from '../../hooks/useBlog';
import { useCategory } from '../../hooks/useCategory'; 
import BlogFormFields from '../../components/dashboard/addblog/BlogFormFields';
import BlogThumbnailUpload from '../../components/dashboard/addblog/BlogThumbnailUpload';
import BlogPublishActions from '../../components/dashboard/addblog/BlogPublishActions';
import BlogEditor from '../../components/dashboard/addblog/BlogEditor';

// ✅ Use a reliable placeholder image
const DEFAULT_THUMBNAIL = 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=400&h=250&fit=crop&crop=center&auto=format';

const EditBlogPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { updateBlog } = useBlog();
  const { fetchCategories } = useCategory();
  
  const [formData, setFormData] = useState({
    title: '',
    categories: [],
    content: '',
    publishImmediately: true,
    allowComments: true
  });
  const [thumbnail, setThumbnail] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [existingThumbnail, setExistingThumbnail] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  
  // ✅ Use a ref to store the fetched content
  const fetchedContentRef = useRef('');
  const isInitializingRef = useRef(true);

  // ✅ Fixed: Removed duplicate extensions
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
        // ✅ Disable link in StarterKit to avoid duplication
        link: false,
      }),
      Image.configure({
        allowBase64: true,
        HTMLAttributes: {
          class: 'blog-image',
        },
      }),
      // ✅ Link added once
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-indigo-600 hover:underline',
        },
      }),
      // ✅ Underline added once
      Underline,
    ],
    content: '', // Will be set after loading
    onUpdate: ({ editor }) => {
      // ✅ Skip the first update (initial content load)
      if (isInitializingRef.current) {
        return;
      }
      
      const html = editor.getHTML();
      setFormData(prev => ({
        ...prev,
        content: html
      }));
    },
  });

  // ✅ Fetch blog data
  const fetchBlog = useCallback(async () => {
    try {
      const { data } = await axios.get(`/blogs/${id}`);
      if (data.success) {
        const blog = data.data;
        setFormData({
          title: blog.title || '',
          categories: blog.categories?.map(c => c._id || c.slug || c) || [],
          content: blog.content || '',
          publishImmediately: blog.status === 'published',
          allowComments: blog.allowComments !== undefined ? blog.allowComments : true
        });
        if (blog.thumbnail) {
          setExistingThumbnail(blog.thumbnail);
          setThumbnailPreview(blog.thumbnail);
        }
        // ✅ Store content in ref for later use
        fetchedContentRef.current = blog.content || '';
        // ✅ Reset initialization flag
        isInitializingRef.current = true;
      } else {
        toast.error(data.message || 'Failed to load blog');
        navigate('/dashboard/blog-lists');
      }
    } catch (error) {
      console.error('Error fetching blog:', error);
      toast.error('Failed to load blog data');
      navigate('/dashboard/blog-lists');
    } finally {
      setIsLoading(false);
    }
  }, [id, navigate]);

  // ✅ Set editor content when both editor and data are ready
  useEffect(() => {
    if (editor && fetchedContentRef.current && !isLoading) {
      try {
        editor.commands.setContent(fetchedContentRef.current);
        // ✅ Mark initialization as complete after content is set
        setTimeout(() => {
          isInitializingRef.current = false;
        }, 0);
      } catch (err) {
        console.error('Error setting editor content:', err);
      }
    }
  }, [editor, isLoading]);

  // ✅ Load data on mount
  useEffect(() => {
    const loadData = async () => {
      await fetchCategories();
      await fetchBlog();
    };
    loadData();
  }, [fetchCategories, fetchBlog]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleCategoriesChange = (categories) => {
    setFormData(prev => ({ ...prev, categories }));
  };

  const handleRemoveThumbnail = () => {
    setThumbnail(null);
    setThumbnailPreview(null);
    setExistingThumbnail(null);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) processFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      processFile(file);
    }
  };

  const processFile = (file) => {
    // ✅ Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size exceeds 5MB limit');
      return;
    }
    
    // ✅ Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }
    
    setThumbnail(file);
    setExistingThumbnail(null);
    const reader = new FileReader();
    reader.onload = (e) => setThumbnailPreview(e.target.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!formData.title.trim()) {
      toast.error('Please enter a blog title');
      setIsSubmitting(false);
      return;
    }
    if (!formData.categories || formData.categories.length === 0) {
      toast.error('Please select at least one category');
      setIsSubmitting(false);
      return;
    }
    if (!formData.content || formData.content === '<p><br></p>' || formData.content === '<p></p>' || formData.content.trim() === '') {
      toast.error('Please write some content for your blog');
      setIsSubmitting(false);
      return;
    }

    const blogData = {
      title: formData.title,
      content: formData.content,
      categories: formData.categories,
      thumbnail: thumbnailPreview || existingThumbnail || DEFAULT_THUMBNAIL,
      status: formData.publishImmediately ? 'published' : 'draft',
      allowComments: formData.allowComments
    };

    const result = await updateBlog(id, blogData);

    setIsSubmitting(false);
    if (result.success) {
      // ✅ Only ONE toast here
      toast.success('Blog updated successfully!');
      navigate('/dashboard/blog-lists');
    } else {
      // ✅ Show error if there is one
      if (result.message) {
        toast.error(result.message);
      }
    }
  };

  const handleSaveDraft = async () => {
    if (!formData.title.trim()) {
      toast.error('Please enter a blog title');
      return;
    }
    if (!formData.content || formData.content === '<p><br></p>' || formData.content === '<p></p>' || formData.content.trim() === '') {
      toast.error('Please write some content for your blog');
      return;
    }

    const blogData = {
      title: formData.title,
      content: formData.content,
      categories: formData.categories || [],
      thumbnail: thumbnailPreview || existingThumbnail || DEFAULT_THUMBNAIL,
      status: 'draft',
      allowComments: formData.allowComments
    };

    const result = await updateBlog(id, blogData);
    if (result.success) {
      // ✅ Only ONE toast here
      toast.success('Draft saved successfully!');
      navigate('/dashboard/blog-lists');
    } else {
      if (result.message) {
        toast.error(result.message);
      }
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  if (isLoading) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 pt-4 pb-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <svg className="animate-spin h-12 w-12 text-indigo-600 mx-auto" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <p className="mt-4 text-[#6b6b84]">Loading blog data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 pt-4 pb-8">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#14141f]">Edit Blog</h1>
          <p className="text-[#6b6b84] text-sm">Update your blog post</p>
        </div>
      </div>

      <form className="space-y-6" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <BlogFormFields
            title={formData.title}
            categories={formData.categories}
            onTitleChange={handleChange}
            onCategoriesChange={handleCategoriesChange}
          />

          <BlogThumbnailUpload
            thumbnail={thumbnail}
            thumbnailPreview={thumbnailPreview}
            existingThumbnail={existingThumbnail} 
            isDragging={isDragging}
            onFileChange={handleFileChange}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onRemoveThumbnail={handleRemoveThumbnail}
          />
        </div>

        <BlogEditor editor={editor} />

        <BlogPublishActions
          publishImmediately={formData.publishImmediately}
          allowComments={formData.allowComments}
          onCheckboxChange={handleChange}
          onSaveDraft={handleSaveDraft}
          isSubmitting={isSubmitting}
          isEditing={true}
        />
      </form>
    </div>
  );
};

export default EditBlogPage;