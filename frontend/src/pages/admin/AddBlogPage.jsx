import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import toast from 'react-hot-toast';
import useBlog from '../../hooks/useBlog';
import { useCategory } from '../../hooks/useCategory'; 
import BlogFormFields from '../../components/dashboard/addblog/BlogFormFields';
import BlogThumbnailUpload from '../../components/dashboard/addblog/BlogThumbnailUpload';
import BlogPublishActions from '../../components/dashboard/addblog/BlogPublishActions';
import BlogEditor from '../../components/dashboard/addblog/BlogEditor';

const DEFAULT_THUMBNAIL = 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=400&h=250&fit=crop&crop=center&auto=format';

const AddBlogPage = () => {
  const navigate = useNavigate();
  const { createBlog } = useBlog();
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // ✅ TipTap Editor Configuration
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
        link: false, // ✅ Disable link in StarterKit to avoid duplication
      }),
      Image.configure({
        allowBase64: true,
        HTMLAttributes: {
          class: 'blog-image',
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-indigo-600 hover:underline',
        },
      }),
      Underline,
    ],
    content: `
      <h1>Welcome to your blog post!</h1>
      <p>Start writing your content here...</p>
    `,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      setFormData(prev => ({
        ...prev,
        content: html
      }));
    },
  });

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

  const handleRemoveThumbnail = () => {
    setThumbnail(null);
    setThumbnailPreview(null);
  };

  const processFile = (file) => {
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size exceeds 5MB limit');
      return;
    }
    
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }
    
    setThumbnail(file);
    const reader = new FileReader();
    reader.onload = (e) => setThumbnailPreview(e.target.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // ✅ Validate
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
      thumbnail: thumbnailPreview || DEFAULT_THUMBNAIL,
      status: formData.publishImmediately ? 'published' : 'draft',
      allowComments: formData.allowComments
    };

    const result = await createBlog(blogData);

    setIsSubmitting(false);
    if (result.success) {
      // ✅ Only ONE toast here
      toast.success('Blog published successfully!');
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
      thumbnail: thumbnailPreview || DEFAULT_THUMBNAIL,
      status: 'draft',
      allowComments: formData.allowComments
    };

    const result = await createBlog(blogData);
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

  return (
    <div className="px-4 sm:px-6 lg:px-8 pt-4 pb-8">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#14141f]">Add New Blog</h1>
          <p className="text-[#6b6b84] text-sm">Create a new blog post with rich content</p>
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
          isEditing={false}
        />
      </form>
    </div>
  );
};

export default AddBlogPage;