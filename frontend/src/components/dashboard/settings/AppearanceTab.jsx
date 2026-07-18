import { useState, useCallback, useMemo } from 'react';
import useTheme from '../../../hooks/useTheme'; // ✅ Correct import from hooks
import SettingsButton from './SettingsButton';

const AppearanceTab = ({ loading }) => {
  // ✅ Use theme context instead of local state
  const { 
    theme, 
    setTheme, 
    accent, 
    setAccent, 
    fontSize, 
    setFontSize,
    accentColorMap,
    fontSizeMap
  } = useTheme();

  const [localFontSize, setLocalFontSize] = useState(fontSize);

  // ✅ Memoized theme data
  const themes = useMemo(() => [
    { id: 'light', icon: 'fa-sun', color: 'text-amber-500', label: 'Light' },
    { id: 'dark', icon: 'fa-moon', color: 'text-indigo-400', label: 'Dark' },
    { id: 'system', icon: 'fa-desktop', color: 'text-gray-400', label: 'System' }
  ], []);

  // ✅ Memoized accent colors
  const accentColors = useMemo(() => [
    { id: 'indigo', color: '#4f46e5', label: 'Indigo' },
    { id: 'emerald', color: '#059669', label: 'Emerald' },
    { id: 'rose', color: '#e11d48', label: 'Rose' },
    { id: 'amber', color: '#d97706', label: 'Amber' },
    { id: 'purple', color: '#7c3aed', label: 'Purple' },
    { id: 'blue', color: '#2563eb', label: 'Blue' },
    { id: 'pink', color: '#db2777', label: 'Pink' }
  ], []);

  // ✅ Memoized label map
  const labelMap = useMemo(() => ({
    small: 'Small',
    medium: 'Medium',
    large: 'Large'
  }), []);

  // ✅ Handle theme change
  const handleThemeChange = useCallback((newTheme) => {
    setTheme(newTheme);
  }, [setTheme]);

  // ✅ Handle accent change
  const handleAccentChange = useCallback((newAccent) => {
    setAccent(newAccent);
  }, [setAccent]);

  // ✅ Handle font size change
  const handleFontSizeChange = useCallback((newSize) => {
    setLocalFontSize(newSize);
    setFontSize(newSize);
  }, [setFontSize]);

  // ✅ Handle save
  const handleSave = useCallback(() => {
    // All saved via context
    const preferences = { theme, accent, fontSize };
    localStorage.setItem('appearance', JSON.stringify(preferences));
  }, [theme, accent, fontSize]);

  return (
    <div>
      <h2 className="text-xl font-bold text-[#14141f] dark:text-white mb-6">Appearance Settings</h2>
      <div className="space-y-6">
        {/* Theme Mode */}
        <div>
          <label className="block text-sm font-medium text-[#2d2d3f] dark:text-gray-300 mb-2">
            Theme Mode
          </label>
          <div className="grid grid-cols-3 gap-3">
            {themes.map((t) => (
              <button
                key={t.id}
                type="button"
                className={`p-4 rounded-xl border-2 transition text-center ${
                  theme === t.id 
                    ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 dark:border-indigo-400' 
                    : 'border-[#e6e6ed] dark:border-gray-700 hover:border-indigo-400 dark:hover:border-indigo-500'
                }`}
                onClick={() => handleThemeChange(t.id)}
                aria-label={`Switch to ${t.label} theme`}
              >
                <i className={`fas ${t.icon} text-2xl ${t.color}`} aria-hidden="true"></i>
                <p className="text-xs font-medium mt-1 dark:text-gray-300">{t.label}</p>
              </button>
            ))}
          </div>
          <p className="text-xs text-[#6b6b84] dark:text-gray-400 mt-2">
            Current theme: <span className="font-semibold capitalize">{theme}</span>
          </p>
        </div>

        {/* Accent Color */}
        <div>
          <label className="block text-sm font-medium text-[#2d2d3f] dark:text-gray-300 mb-2">
            Accent Color
          </label>
          <div className="flex flex-wrap gap-3">
            {accentColors.map((color) => (
              <button
                key={color.id}
                type="button"
                className={`w-10 h-10 rounded-full border-2 border-white dark:border-gray-700 shadow-sm hover:scale-110 transition flex items-center justify-center ${
                  accent === color.id ? 'ring-2 ring-offset-2 ring-indigo-600 dark:ring-indigo-400 scale-110' : ''
                }`}
                style={{ backgroundColor: color.color }}
                onClick={() => handleAccentChange(color.id)}
                title={color.label}
                aria-label={`Select ${color.label} accent color`}
              >
                {accent === color.id && (
                  <i className="fas fa-check text-white text-xs" aria-hidden="true"></i>
                )}
              </button>
            ))}
          </div>
          <p className="text-xs text-[#6b6b84] dark:text-gray-400 mt-2">
            Current accent: <span className="font-semibold capitalize">{accent}</span>
          </p>
        </div>

        {/* Font Size */}
        <div>
          <label className="block text-sm font-medium text-[#2d2d3f] dark:text-gray-300 mb-2">
            Font Size
          </label>
          <div className="flex gap-3">
            {['small', 'medium', 'large'].map((size) => (
              <button
                key={size}
                type="button"
                className={`flex-1 py-3 px-4 rounded-xl border-2 transition text-center ${
                  localFontSize === size 
                    ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 dark:border-indigo-400 font-semibold' 
                    : 'border-[#e6e6ed] dark:border-gray-700 hover:border-indigo-400 dark:hover:border-indigo-500'
                }`}
                onClick={() => handleFontSizeChange(size)}
                style={{ fontSize: fontSizeMap[size] }}
                aria-label={`Switch to ${labelMap[size]} font size`}
              >
                <span className="dark:text-gray-300">{labelMap[size]}</span>
                {localFontSize === size && (
                  <i className="fas fa-check ml-2 text-indigo-600 dark:text-indigo-400" aria-hidden="true"></i>
                )}
              </button>
            ))}
          </div>
          <p className="text-xs text-[#6b6b84] dark:text-gray-400 mt-2">
            Current size: <span className="font-semibold capitalize">{localFontSize}</span>
          </p>
        </div>

        {/* Preview Section */}
        <div className="mt-6 p-4 bg-[#faf9f6] dark:bg-gray-800 rounded-xl border border-[#e6e6ed] dark:border-gray-700">
          <p className="text-sm font-medium text-[#2d2d3f] dark:text-gray-300 mb-2">Preview</p>
          <div className="space-y-2">
            <h3 className="text-lg font-bold text-[#14141f] dark:text-white">Sample Heading</h3>
            <p className="text-[#4a4a5e] dark:text-gray-300" style={{ fontSize: fontSizeMap[localFontSize] }}>
              This is how your content will look with the selected settings.
            </p>
            <button 
              type="button"
              className={`px-4 py-2 rounded-xl text-white text-sm font-medium transition ${accentColorMap[accent]}`}
            >
              Sample Button
            </button>
          </div>
        </div>

        <SettingsButton type="button" onClick={handleSave} loading={loading}>
          <i className="fas fa-save mr-2" aria-hidden="true"></i> Save Preferences
        </SettingsButton>
      </div>
    </div>
  );
};

export default AppearanceTab;