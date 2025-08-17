import daisyui from 'daisyui';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        'nunito': ['Nunito', 'sans-serif'],
      },
    },
  },
  plugins: [daisyui],
  daisyui: {
    themes: [
      {
        talehavenEnchanted: {
          "primary": "#413398",
          "primary-content": "#ffffff",
          "secondary": "#f7c7e1", 
          "secondary-content": "#3b3a3a",
          "accent": "#b2a3db",
          "accent-content": "#3b3a3a",
          "neutral": "#ffffff",
          "neutral-content": "#3b3a3a",
          "base-100": "#f6f0f6",
          "base-200": "#f0e8f3", 
          "base-300": "#d9c4d7",
          "base-content": "#3b3a3a",
          "info": "#7ba9eb",
          "info-content": "#ffffff",
          "success": "#57d68a",
          "success-content": "#ffffff",
          "warning": "#f0b24c",
          "warning-content": "#3b3a3a",
          "error": "#e57373",
          "error-content": "#ffffff",
        },
      },
    ],
  },
};
