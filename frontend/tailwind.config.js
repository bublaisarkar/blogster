/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // ✅ Keep only light theme colors
        light: {
          bg: '#faf9f6',
          card: '#ffffff',
          border: '#edebf5',
          text: '#1e1e2a',
          muted: '#6b6b84',
        }
      },
    },
  },
  plugins: [],
}