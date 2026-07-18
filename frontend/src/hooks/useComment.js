import { useContext } from 'react';
import CommentContext from '../context/CommentContext';

const useComment = () => {
  const context = useContext(CommentContext);
  
  if (!context) {
    throw new Error('useComment must be used within a CommentProvider');
  }
  
  return context;
};

export default useComment;