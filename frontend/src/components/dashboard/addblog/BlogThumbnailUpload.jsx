import { useRef } from 'react';

// ✅ Use a reliable placeholder image that works
const DEFAULT_THUMBNAIL = 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=400&h=250&fit=crop&crop=center&auto=format';

const BlogThumbnailUpload = ({ 
  thumbnail, 
  thumbnailPreview, 
  existingThumbnail,
  isDragging, 
  onFileChange, 
  onDrop, 
  onDragOver, 
  onDragLeave,
  onRemoveThumbnail
}) => {
  const fileInputRef = useRef(null);

  // ✅ Determine which image to display
  const displayImage = thumbnailPreview || existingThumbnail || DEFAULT_THUMBNAIL;

  // ✅ Check if we have a custom image (not the default)
  const hasCustomImage = thumbnailPreview || existingThumbnail;

  // ✅ Handle remove thumbnail
  const handleRemoveThumbnail = (e) => {
    e.stopPropagation();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (onRemoveThumbnail) {
      onRemoveThumbnail();
    }
  };

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-[#edebf5] shadow-sm">
      <label className="block text-sm font-semibold text-[#2d2d3f] mb-1.5">
        <i className="fas fa-image mr-2 text-indigo-500"></i> Thumbnail
      </label>
      <div 
        className={`rounded-xl p-6 text-center cursor-pointer border-2 border-dashed transition ${
          isDragging ? 'border-indigo-500 bg-indigo-50' : 'border-[#d1d0db] hover:border-indigo-400 hover:bg-[#f8f7fc]'
        }`}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input 
          type="file" 
          ref={fileInputRef}
          className="hidden" 
          accept="image/*" 
          onChange={onFileChange}
        />
        
        {!displayImage ? (
          // ✅ Empty state - no image
          <>
            <i className="fas fa-cloud-upload-alt text-3xl text-[#b5b0cf] mb-2"></i>
            <p className="text-sm text-[#6b6b84]">Click or drag & drop to upload</p>
            <p className="text-xs text-[#908db0] mt-1">Recommended: 1200 x 630px</p>
          </>
        ) : (
          // ✅ Image preview state
          <div className="relative">
            <img 
              src={displayImage} 
              alt="Thumbnail preview" 
              className="max-h-32 rounded-lg mx-auto object-cover"
              onError={(e) => {
                // ✅ Fallback if image fails to load
                e.target.src = DEFAULT_THUMBNAIL;
              }}
            />
            <div className="flex items-center justify-center gap-3 mt-2">
              <p className="text-xs text-emerald-600">
                <i className="fas fa-check-circle mr-1"></i> 
                {thumbnailPreview ? `New file: ${thumbnail?.name || 'image'}` : 
                 existingThumbnail ? 'Current thumbnail' : 'Default thumbnail'}
              </p>
              {hasCustomImage && onRemoveThumbnail && (
                <button
                  type="button"
                  onClick={handleRemoveThumbnail}
                  className="text-xs text-red-500 hover:text-red-700 transition flex items-center gap-1"
                >
                  <i className="fas fa-times-circle"></i> Remove
                </button>
              )}
            </div>
          </div>
        )}
      </div>
      
      {/* ✅ Helper text */}
      <p className="text-xs text-[#6b6b84] mt-2">
        <i className="fas fa-info-circle mr-1"></i>
        Supported formats: JPG, PNG, WebP. Max size: 5MB
      </p>
    </div>
  );
};

export default BlogThumbnailUpload;