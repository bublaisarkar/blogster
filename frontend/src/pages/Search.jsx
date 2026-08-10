import { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import toast from 'react-hot-toast';

const Search = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch results when query changes
  useEffect(() => {
    if (!query.trim()) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setResults([]);
      return;
    }

    const fetchResults = async () => {
      try {
        setLoading(true);
        setError(null);
        const { data } = await axios.get(`/blogs/search?q=${encodeURIComponent(query)}`);
        if (data.success) {
          setResults(data.data || []);
        } else {
          setResults([]);
        }
      } catch (err) {
        console.error('Search error:', err);
        setError('Failed to fetch search results');
        toast.error('Search failed');
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchResults, 300);
    return () => clearTimeout(timer);
  }, [query]);

  // Handle search form submission
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const input = e.target.elements.searchInput.value.trim();
    if (input) {
      navigate(`/search?q=${encodeURIComponent(input)}`);
    } else {
      // Optionally clear the query
      navigate('/search');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 mt-6">
      <h1 className="text-2xl font-bold mb-4">Search</h1>

      {/* ✅ Search box inside the page */}
      <form onSubmit={handleSearchSubmit} className="flex items-center bg-white border border-gray-300 rounded-lg px-4 py-2 mb-6 shadow-sm">
        <input
          name="searchInput"
          type="text"
          placeholder="Search for posts..."
          defaultValue={query}
          className="flex-1 outline-none text-sm"
        />
        <button type="submit" className="text-indigo-600 hover:text-indigo-800 ml-2">
          <i className="fas fa-search"></i>
        </button>
      </form>

      {query && <p className="text-gray-600 mb-6">Showing results for: <span className="font-semibold">"{query}"</span></p>}

      {loading && (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-indigo-600 border-t-transparent"></div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg">{error}</div>
      )}

      {!loading && !error && results.length === 0 && query && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <i className="fas fa-search text-4xl text-gray-300 mb-3"></i>
          <p className="text-gray-500">No posts found for "{query}"</p>
        </div>
      )}

      {!loading && results.length > 0 && (
        <div className="space-y-6">
          {results.map((post) => (
            <Link
              key={post._id}
              to={`/blog/${post.slug || post._id}`}
              className="block bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition p-5"
            >
              <h2 className="text-xl font-semibold text-indigo-700 hover:underline">{post.title}</h2>
              {post.excerpt && <p className="text-gray-600 mt-1 line-clamp-2">{post.excerpt}</p>}
              <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                <span><i className="far fa-user mr-1"></i> {post.author?.name || 'Unknown'}</span>
                <span><i className="far fa-calendar mr-1"></i> {new Date(post.createdAt).toLocaleDateString()}</span>
                <span><i className="far fa-eye mr-1"></i> {post.views || 0}</span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {!query && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <i className="fas fa-search text-4xl text-gray-300 mb-3"></i>
          <p className="text-gray-500">Type something in the search bar to find posts</p>
        </div>
      )}
    </div>
  );
};

export default Search;