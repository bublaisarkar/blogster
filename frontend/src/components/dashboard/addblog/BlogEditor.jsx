// components/dashboard/addblog/BlogEditor.jsx
import { EditorContent } from '@tiptap/react';
import BlogEditorToolbar from './BlogEditorToolbar';

const BlogEditor = ({ editor }) => {
  if (!editor) {
    return (
      <div className="border border-gray-300 rounded-xl overflow-hidden bg-white">
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
          <span className="ml-3 text-gray-500">Loading editor...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="border border-gray-300 rounded-xl overflow-hidden bg-white shadow-sm">
      <BlogEditorToolbar editor={editor} />
      <EditorContent
        editor={editor}
        className="
          min-h-[500px] px-8 py-6 
          prose prose-lg max-w-none focus:outline-none
          
          /* ✅ Headings */
          [&_h1]:text-4xl [&_h1]:font-bold [&_h1]:my-8 [&_h1]:leading-tight [&_h1]:text-gray-900
          [&_h2]:text-3xl [&_h2]:font-bold [&_h2]:my-6 [&_h2]:leading-tight [&_h2]:text-gray-900
          [&_h3]:text-2xl [&_h3]:font-semibold [&_h3]:my-5 [&_h3]:leading-snug [&_h3]:text-gray-900
          
          /* ✅ Paragraphs */
          [&_p]:my-3
          
          /* ✅ Lists */
          [&_ul]:pl-7 [&_ul]:my-3
          [&_ol]:pl-7 [&_ol]:my-3
          [&_li]:my-1
          
          /* ✅ Blockquotes */
          [&_blockquote]:border-l-4 [&_blockquote]:border-gray-300 
          [&_blockquote]:pl-5 [&_blockquote]:my-6 
          [&_blockquote]:italic [&_blockquote]:text-gray-600
          
          /* ✅ Code Blocks */
          [&_pre]:bg-[#1e1e1e] [&_pre]:text-[#e6edf3] 
          [&_pre]:rounded-xl [&_pre]:p-5 
          [&_pre]:overflow-x-auto [&_pre]:my-5 [&_pre]:text-sm
          [&_code]:font-mono [&_code]:text-sm
          [&_pre_code]:text-inherit [&_pre_code]:bg-transparent [&_pre_code]:p-0
          
          /* ✅ Inline Code */
          [&_code:not(pre_code)]:bg-gray-100 
          [&_code:not(pre_code)]:px-1.5 [&_code:not(pre_code)]:py-0.5 
          [&_code:not(pre_code)]:rounded [&_code:not(pre_code)]:text-gray-800
          
          /* ✅ Images */
          [&_img]:block [&_img]:max-w-full 
          [&_img]:rounded-xl [&_img]:my-6 [&_img]:mx-auto 
          [&_img]:shadow-sm
          
          /* ✅ Links */
          [&_a]:text-indigo-600 [&_a]:underline [&_a]:underline-offset-2 
          [&_a:hover]:text-indigo-700
          
          /* ✅ Horizontal Rule */
          [&_hr]:my-8 [&_hr]:border-none [&_hr]:border-t-2 [&_hr]:border-gray-200
          
          /* ✅ Tables */
          [&_table]:border-collapse [&_table]:w-full [&_table]:my-4
          [&_table_td]:border [&_table_td]:border-gray-200 [&_table_td]:px-3 [&_table_td]:py-2
          [&_table_th]:border [&_table_th]:border-gray-200 [&_table_th]:px-3 [&_table_th]:py-2
          [&_table_th]:bg-gray-50 [&_table_th]:font-semibold
        "
      />
    </div>
  );
};

export default BlogEditor;