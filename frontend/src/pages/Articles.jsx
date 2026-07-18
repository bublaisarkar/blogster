// pages/Articles.jsx
import { useSearchParams } from 'react-router-dom';
import ArticlesPage from "../components/articles/ArticlesPage";
import PageHeader from "../components/articles/PageHeader";

const Articles = () => {
  const [searchParams] = useSearchParams();
  const sort = searchParams.get('sort') || 'newest';

  return (
    <>
      <PageHeader sort={sort} />
      <ArticlesPage />
    </>
  );
};

export default Articles;