import { Link } from 'react-router-dom';

const ArticleCard = ({ article }) => {
  // ✅ Format date – the actual date string comes from the parent (createdAt || publishedAt)
  const formatDate = (dateString) => {
    if (!dateString) return 'Recent';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <Link to={`/blog/${article.slug}`} className="block">
      <div className="article-card bg-white rounded-2xl overflow-hidden shadow-sm border border-[#efedf5] hover:shadow-md transition flex flex-col h-full">
        <img 
          src={article.image} 
          alt={article.alt} 
          className="w-full h-44 sm:h-48 object-cover" 
        />
        <div className="p-4 sm:p-5 flex-1 flex flex-col">
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-block bg-[#eae9f2] text-[#33334a] text-xs font-semibold uppercase px-3 py-1 rounded-full">
              {article.categoryName || article.category}
            </span>
            <span className="text-xs text-[#6b6b84]">
              <i className="far fa-calendar-alt mr-1"></i> {formatDate(article.date)}
            </span>
          </div>
          <h3 className="text-lg sm:text-xl font-semibold mb-2">{article.title}</h3>
          <p className="text-[#5a5a72] text-sm flex-1">{article.excerpt}</p>
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#f0eef8]">
            <div className="flex items-center gap-2">
              <img 
                src={article.authorAvatar} 
                alt={article.author} 
                className="w-6 h-6 rounded-full object-cover" 
              />
              <span className="text-xs text-[#6b6b84]">{article.author}</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-[#6b6b84]">
              <span><i className="far fa-heart mr-1"></i> {article.likes}</span>
              <span><i className="far fa-comment mr-1"></i> {article.comments}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ArticleCard;