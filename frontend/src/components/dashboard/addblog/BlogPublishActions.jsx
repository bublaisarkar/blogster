

const BlogPublishActions = ({ 
  publishImmediately, 
  allowComments, 
  onCheckboxChange, 
  onSaveDraft, 
  isSubmitting,
  isEditing = false 
}) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 bg-white rounded-2xl p-5 sm:p-6 border border-[#edebf5] shadow-sm">
      <div className="flex flex-wrap items-center gap-4">
        <label className="flex items-center gap-2 text-sm text-[#2d2d3f] cursor-pointer">
          <input 
            type="checkbox" 
            name="publishImmediately"
            checked={publishImmediately}
            onChange={onCheckboxChange}
            className="w-4 h-4 rounded border-[#e6e6ed] text-indigo-600 focus:ring-indigo-500 focus:ring-offset-0 transition" 
          />
          <span>Publish immediately</span>
        </label>
        <label className="flex items-center gap-2 text-sm text-[#2d2d3f] cursor-pointer">
          <input 
            type="checkbox" 
            name="allowComments"
            checked={allowComments}
            onChange={onCheckboxChange}
            className="w-4 h-4 rounded border-[#e6e6ed] text-indigo-600 focus:ring-indigo-500 focus:ring-offset-0 transition" 
          />
          <span>Allow comments</span>
        </label>
      </div>
      <div className="flex flex-wrap gap-3">
        <button 
          type="button" 
          onClick={onSaveDraft}
          className="px-6 py-2.5 rounded-xl border border-[#e6e6ed] bg-white hover:bg-[#faf9f6] transition text-sm font-medium text-[#2d2d3f]"
        >
          <i className="fas fa-save mr-2"></i> Save Draft
        </button>
        <button 
          type="submit" 
          disabled={isSubmitting}
          className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white transition text-sm font-medium flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              {isEditing ? 'Updating...' : 'Publishing...'}
            </>
          ) : (
            <>
              <i className={`fas ${isEditing ? 'fa-save' : 'fa-rocket'}`}></i> 
              {isEditing ? 'Update Blog' : 'Publish'}
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default BlogPublishActions;