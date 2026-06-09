/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        maroon: {
          50: '#FDF5F5',
          100: '#F9E8E8',
          200: '#F1CFCF',
          300: '#E6ABAB',
          400: '#D87B7B',
          500: '#B84A4A',
          600: '#8A2C2C',
          700: '#6B1A1A',
          800: '#521414',
          900: '#3D0F0F',
          950: '#2A0A0A',
        },
        gold: {
          50: '#FFFDF3',
          100: '#FFF8DB',
          200: '#FFEFB3',
          300: '#FFE58B',
          400: '#F5C04A',
          500: '#E5A91E',
          600: '#C48A12',
          700: '#9A6D0E',
          800: '#7A550E',
          900: '#604410',
        },
        warm: {
          50: '#FFF8F0',
          100: '#FFF0E0',
          200: '#FFE4C7',
          300: '#FFD5A8',
          400: '#FFB875',
          500: '#FB923C',
          600: '#EA580C',
          700: '#C2410C',
          800: '#9A3412',
          900: '#7C2D12',
        },
      },
      fontFamily: {
        sans: ['Poppins', 'Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
