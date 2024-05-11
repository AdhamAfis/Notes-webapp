/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
    './public/index.html',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#f3f4f6',
        secondary: '#4f46e5',
      
      },
    },
  },
  plugins: [],
}

