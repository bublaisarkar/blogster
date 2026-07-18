// components/dashboard/addblog/BlogEditorToolbar.jsx
import { useRef, useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import axios from '../../../api/axios';
import {
  Heading1,
  Heading2,
  Heading3,
  Bold,
  Italic,
  Strikethrough,
  List,
  ListOrdered,
  Quote,
  Code,
  Link as LinkIcon,
  Unlink,
  Image as ImageIcon,
  Eraser,
  Undo,
  Redo,
  ChevronDown,
} from 'lucide-react';

// ============================================================
// ✅ CONSTANTS
// ============================================================

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const IMAGE_EXTENSIONS = /\.(png|jpg|jpeg|gif|webp)(\?.*)?$/i;

// ============================================================
// ✅ UTILITY FUNCTIONS
// ============================================================

const isValidUrl = (url) => {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
};

const isValidImageUrl = (url) => {
  return isValidUrl(url) && IMAGE_EXTENSIONS.test(url);
};

const validateImage = (file) => {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    toast.error('Please upload a valid image (JPEG, PNG, GIF, or WebP)');
    return false;
  }
  if (file.size > MAX_IMAGE_SIZE) {
    toast.error('Image must be less than 5MB');
    return false;
  }
  return true;
};

// ============================================================
// ✅ SUB-COMPONENTS
// ============================================================

const Divider = () => (
  <span className="w-px h-6 bg-gray-200 mx-1 flex-shrink-0" aria-hidden="true" />
);

const ToolbarButton = ({ 
  onClick, 
  isActive = false, 
  disabled = false, 
  title, 
  children,
  className = ''
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      aria-label={title}
      className={`
        h-8 w-8 rounded-md
        flex items-center justify-center
        transition-colors
        hover:bg-gray-200
        ${isActive ? 'bg-indigo-100 text-indigo-600' : 'text-gray-600'}
        ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
    >
      {children}
    </button>
  );
};

const ToolbarGroup = ({ children }) => (
  <div className="flex items-center gap-0.5">{children}</div>
);

// ============================================================
// ✅ MAIN COMPONENT
// ============================================================

const BlogEditorToolbar = ({ editor }) => {
  const fileInputRef = useRef(null);
  const dropdownRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isImageDropdownOpen, setIsImageDropdownOpen] = useState(false);
  const abortControllerRef = useRef(null);

  // ✅ Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsImageDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ✅ Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  if (!editor) return null;

  // ============================================================
  // ✅ HELPERS
  // ============================================================

  const isHeadingActive = (level) => {
    return editor.isActive('heading', { level });
  };

  // ============================================================
  // ✅ HANDLERS
  // ============================================================

  const handleHeading = (level) => {
    if (!editor) return;
    if (isHeadingActive(level)) {
      editor.chain().focus().setParagraph().run();
    } else {
      editor.chain().focus().toggleHeading({ level }).run();
    }
  };

  const handleCommand = (command) => {
    editor.chain().focus()[command]().run();
  };

  const handleLink = () => {
    const { from, to } = editor.state.selection;
    if (from === to) {
      toast.error('Select text first to add a link');
      return;
    }
    const url = window.prompt('Enter URL:');
    if (!url) return;
    if (!isValidUrl(url)) {
      toast.error('Please enter a valid URL (e.g., https://example.com)');
      return;
    }
    editor.chain().focus().setLink({ href: url }).run();
  };

  const handleUnlink = () => {
    editor.chain().focus().unsetLink().run();
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (isUploading) {
      toast.error('Upload already in progress');
      return;
    }
    if (!validateImage(file)) {
      event.target.value = '';
      return;
    }
    setIsUploading(true);
    setIsImageDropdownOpen(false);
    abortControllerRef.current = new AbortController();

    try {
      const formData = new FormData();
      formData.append('image', file);
      const { data } = await axios.post('/blogs/upload-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        signal: abortControllerRef.current.signal,
      });
      if (data.success) {
        editor.chain().focus().setImage({ src: data.data.url }).run();
        toast.success('Image uploaded successfully!');
      } else {
        toast.error(data.message || 'Failed to upload image');
      }
    } catch (error) {
      if (error.name === 'AbortError' || error.code === 'ERR_CANCELED') return;
      toast.error(error.response?.data?.message || 'Failed to upload image');
    } finally {
      setIsUploading(false);
      abortControllerRef.current = null;
      event.target.value = '';
    }
  };

  const handleImageUrl = () => {
    const url = window.prompt('Enter image URL:');
    if (!url) return;
    if (!isValidImageUrl(url)) {
      toast.error('Please enter a valid image URL');
      return;
    }
    editor.chain().focus().setImage({ src: url }).run();
    setIsImageDropdownOpen(false);
  };

  const handleClearFormatting = () => {
    editor.chain().focus().clearNodes().unsetAllMarks().run();
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
    setIsImageDropdownOpen(false);
  };

  const toggleImageDropdown = () => {
    setIsImageDropdownOpen((prev) => !prev);
  };

  // ============================================================
  // ✅ RENDER
  // ============================================================

  return (
    <div className="border-b border-gray-200 bg-gray-50 px-3 py-2 flex flex-wrap items-center gap-1">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleImageUpload}
        accept={ALLOWED_IMAGE_TYPES.join(',')}
        className="hidden"
        aria-label="Upload image"
        disabled={isUploading}
      />

      {/* Headings */}
      <ToolbarGroup>
        <ToolbarButton
          onClick={() => handleHeading(1)}
          isActive={isHeadingActive(1)}
          title="Heading 1"
        >
          <Heading1 size={18} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => handleHeading(2)}
          isActive={isHeadingActive(2)}
          title="Heading 2"
        >
          <Heading2 size={18} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => handleHeading(3)}
          isActive={isHeadingActive(3)}
          title="Heading 3"
        >
          <Heading3 size={18} />
        </ToolbarButton>
      </ToolbarGroup>

      <Divider />

      {/* Text Formatting */}
      <ToolbarGroup>
        <ToolbarButton
          onClick={() => handleCommand('toggleBold')}
          isActive={editor.isActive('bold')}
          title="Bold"
        >
          <Bold size={18} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => handleCommand('toggleItalic')}
          isActive={editor.isActive('italic')}
          title="Italic"
        >
          <Italic size={18} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => handleCommand('toggleStrike')}
          isActive={editor.isActive('strike')}
          title="Strikethrough"
        >
          <Strikethrough size={18} />
        </ToolbarButton>
      </ToolbarGroup>

      <Divider />

      {/* Lists */}
      <ToolbarGroup>
        <ToolbarButton
          onClick={() => handleCommand('toggleBulletList')}
          isActive={editor.isActive('bulletList')}
          title="Bullet List"
        >
          <List size={18} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => handleCommand('toggleOrderedList')}
          isActive={editor.isActive('orderedList')}
          title="Numbered List"
        >
          <ListOrdered size={18} />
        </ToolbarButton>
      </ToolbarGroup>

      <Divider />

      {/* Block Elements */}
      <ToolbarGroup>
        <ToolbarButton
          onClick={() => handleCommand('toggleBlockquote')}
          isActive={editor.isActive('blockquote')}
          title="Quote"
        >
          <Quote size={18} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => handleCommand('toggleCodeBlock')}
          isActive={editor.isActive('codeBlock')}
          title="Code Block"
        >
          <Code size={18} />
        </ToolbarButton>
      </ToolbarGroup>

      <Divider />

      {/* Links */}
      <ToolbarGroup>
        <ToolbarButton
          onClick={handleLink}
          isActive={editor.isActive('link')}
          title="Add Link"
        >
          <LinkIcon size={18} />
        </ToolbarButton>
        <ToolbarButton
          onClick={handleUnlink}
          disabled={!editor.isActive('link')}
          title="Remove Link"
        >
          <Unlink size={18} />
        </ToolbarButton>
      </ToolbarGroup>

      <Divider />

      {/* Image Upload */}
      <div className="relative" ref={dropdownRef}>
        <ToolbarGroup>
          <ToolbarButton
            onClick={triggerFileInput}
            disabled={isUploading}
            title={isUploading ? 'Uploading...' : 'Upload Image'}
          >
            <ImageIcon size={18} />
          </ToolbarButton>
          <ToolbarButton
            onClick={toggleImageDropdown}
            title="Image options"
          >
            <ChevronDown size={16} />
          </ToolbarButton>
        </ToolbarGroup>
        
        {isImageDropdownOpen && (
          <div className="absolute top-full left-0 mt-1 bg-white rounded-xl border border-gray-200 shadow-lg z-10 min-w-[200px] py-1">
            <button
              type="button"
              onClick={triggerFileInput}
              disabled={isUploading}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ImageIcon size={16} className="text-gray-500" />
              Upload from computer
            </button>
            <button
              type="button"
              onClick={handleImageUrl}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition flex items-center gap-3"
            >
              <LinkIcon size={16} className="text-gray-500" />
              Insert from URL
            </button>
          </div>
        )}
      </div>

      <Divider />

      {/* Clear Formatting */}
      <ToolbarGroup>
        <ToolbarButton
          onClick={handleClearFormatting}
          title="Clear Formatting"
        >
          <Eraser size={18} />
        </ToolbarButton>
      </ToolbarGroup>

      {/* Undo / Redo - Right aligned */}
      <div className="flex items-center gap-0.5 ml-auto">
        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().chain().focus().undo().run()}
          title="Undo"
        >
          <Undo size={18} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().chain().focus().redo().run()}
          title="Redo"
        >
          <Redo size={18} />
        </ToolbarButton>
      </div>
    </div>
  );
};

export default BlogEditorToolbar;