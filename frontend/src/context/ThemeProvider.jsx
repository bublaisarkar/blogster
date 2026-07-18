import { useState, useEffect, useMemo, useCallback } from 'react';
import ThemeContext from './ThemeContext';

export const ThemeProvider = ({ children }) => {
  // ✅ Load saved preferences
  const getSavedPreferences = useCallback(() => {
    const saved = localStorage.getItem('appearance');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  }, []);

  const [accent, setAccent] = useState(() => {
    const prefs = getSavedPreferences();
    return prefs?.accent || 'indigo';
  });

  const [fontSize, setFontSize] = useState(() => {
    const prefs = getSavedPreferences();
    return prefs?.fontSize || 'medium';
  });

  // ✅ Save preferences to localStorage
  useEffect(() => {
    localStorage.setItem('appearance', JSON.stringify({ accent, fontSize }));
  }, [accent, fontSize]);

  // ✅ Accent color mapping
  const accentColorMap = useMemo(() => ({
    indigo: 'bg-indigo-600 hover:bg-indigo-700 border-indigo-600 focus:ring-indigo-500 text-white',
    emerald: 'bg-emerald-600 hover:bg-emerald-700 border-emerald-600 focus:ring-emerald-500 text-white',
    rose: 'bg-rose-600 hover:bg-rose-700 border-rose-600 focus:ring-rose-500 text-white',
    amber: 'bg-amber-600 hover:bg-amber-700 border-amber-600 focus:ring-amber-500 text-white',
    purple: 'bg-purple-600 hover:bg-purple-700 border-purple-600 focus:ring-purple-500 text-white',
    blue: 'bg-blue-600 hover:bg-blue-700 border-blue-600 focus:ring-blue-500 text-white',
    pink: 'bg-pink-600 hover:bg-pink-700 border-pink-600 focus:ring-pink-500 text-white',
  }), []);

  // ✅ Accent color for text and borders (light versions)
  const accentTextMap = useMemo(() => ({
    indigo: 'text-indigo-600 hover:text-indigo-700',
    emerald: 'text-emerald-600 hover:text-emerald-700',
    rose: 'text-rose-600 hover:text-rose-700',
    amber: 'text-amber-600 hover:text-amber-700',
    purple: 'text-purple-600 hover:text-purple-700',
    blue: 'text-blue-600 hover:text-blue-700',
    pink: 'text-pink-600 hover:text-pink-700',
  }), []);

  // ✅ Accent color for backgrounds (light versions)
  const accentBgMap = useMemo(() => ({
    indigo: 'bg-indigo-50 hover:bg-indigo-100',
    emerald: 'bg-emerald-50 hover:bg-emerald-100',
    rose: 'bg-rose-50 hover:bg-rose-100',
    amber: 'bg-amber-50 hover:bg-amber-100',
    purple: 'bg-purple-50 hover:bg-purple-100',
    blue: 'bg-blue-50 hover:bg-blue-100',
    pink: 'bg-pink-50 hover:bg-pink-100',
  }), []);

  // ✅ Font size mapping
  const fontSizeMap = useMemo(() => ({
    small: '14px',
    medium: '16px',
    large: '18px'
  }), []);

  // ✅ Apply font size to body
  useEffect(() => {
    document.body.style.fontSize = fontSizeMap[fontSize] || '16px';
  }, [fontSize, fontSizeMap]);

  const value = {
    accent,
    setAccent,
    fontSize,
    setFontSize,
    accentColorMap,
    accentTextMap,
    accentBgMap,
    fontSizeMap,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;