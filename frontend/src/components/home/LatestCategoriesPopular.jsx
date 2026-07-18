import LatestArticles from './LatestArticles';
import Categories from './Categories';
import PopularPosts from './PopularPosts';

const LatestCategoriesPopular = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 mt-6">
      <LatestArticles />
      <div>
        <Categories />
        <PopularPosts />
      </div>
    </div>
  );
};

export default LatestCategoriesPopular;