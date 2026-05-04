
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1a472a',
          50: '#f0f7f3',
          100: '#dbeee1',
          200: '#b9ddc5',
          300: '#8cc5a2',
          400: '#5da87c',
          500: '#3a8c5f',
          600: '#2a6f4a',
          700: '#1a472a',
          800: '#153d23',
          900: '#10301b',
        },
        accent: {
          DEFAULT: '#f59e0b',
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
        cream: {
          DEFAULT: '#faf8f5',
          50: '#fdfcfa',
          100: '#faf8f5',
          200: '#f5f0e8',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Playfair Display', 'serif'],
        body: ['Poppins', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0,0,0,0.07), 0 4px 6px -4px rgba(0,0,0,0.05)',
        'soft-lg': '0 10px 30px -5px rgba(0,0,0,0.08), 0 4px 6px -4px rgba(0,0,0,0.05)',
        'soft-xl': '0 20px 50px -10px rgba(0,0,0,0.1)',
        'glow-primary': '0 0 20px rgba(26, 71, 42, 0.15)',
        'glow-accent': '0 0 20px rgba(245, 158, 11, 0.2)',
      },
      keyframes: {
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        'badge-pop': {
          '0%': { transform: 'scale(0.5)', opacity: '0' },
          '70%': { transform: 'scale(1.15)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      animation: {
        'float': 'float 4s ease-in-out infinite',
        'badge-pop': 'badge-pop 0.35s ease-out',
      },
    },
  },
  plugins: [],
};
