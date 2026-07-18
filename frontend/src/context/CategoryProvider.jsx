// src/context/CategoryProvider.jsx
import { useState, useCallback } from 'react';
// ✅ Remove toast import
// import toast from 'react-hot-toast';
import axios from '../api/axios';
import CategoryContext from './CategoryContext';

export const CategoryProvider = ({ children }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  // ✅ Fetch all categories - NO TOAST
  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axios.get('/categories');
      if (data.success) {
        setCategories(data.data);
        return { success: true, data: data.data };
      }
      return { success: false, message: data.message };
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to fetch categories';
      console.error('Fetch categories error:', message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ Create category - NO TOAST
  const createCategory = async (categoryData) => {
    try {
      const { data } = await axios.post('/categories', categoryData);
      if (data.success) {
        setCategories(prev => [...prev, data.data]);
        // ✅ NO toast here - let component handle it
        return { success: true, data: data.data };
      }
      return { success: false, message: data.message };
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to create category';
      console.error('Create category error:', message);
      return { success: false, message };
    }
  };

  // ✅ Update category - NO TOAST
  const updateCategory = async (id, categoryData) => {
    try {
      const { data } = await axios.put(`/categories/${id}`, categoryData);
      if (data.success) {
        setCategories(prev => prev.map(cat => 
          cat._id === id ? data.data : cat
        ));
        // ✅ NO toast here - let component handle it
        return { success: true, data: data.data };
      }
      return { success: false, message: data.message };
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to update category';
      console.error('Update category error:', message);
      return { success: false, message };
    }
  };

  // ✅ Delete category - NO TOAST
  const deleteCategory = async (id) => {
    try {
      const { data } = await axios.delete(`/categories/${id}`);
      if (data.success) {
        setCategories(prev => prev.filter(cat => cat._id !== id));
        // ✅ NO toast here - let component handle it
        return { success: true };
      }
      return { success: false, message: data.message };
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to delete category';
      console.error('Delete category error:', message);
      return { success: false, message };
    }
  };

  const value = {
    categories,
    loading,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory
  };

  return (
    <CategoryContext.Provider value={value}>
      {children}
    </CategoryContext.Provider>
  );
};

export default CategoryProvider;