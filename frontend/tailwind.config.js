/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fdf8f0',
          100: '#faefd9',
          200: '#f4dab2',
          300: '#ecbf7e',
          400: '#e39d4a',
          500: '#d4821e',
          600: '#b86a14',
          700: '#985212',
          800: '#7c4316',
          900: '#673916',
          950: '#3a1c09',
        },
        gold: {
          400: '#f5c842',
          500: '#e8b923',
          600: '#c9981a',
        },
        charcoal: {
          800: '#1a1a1a',
          900: '#0f0f0f',
          950: '#080808',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Playfair Display', 'Georgia', 'serif'],
        display: ['Cormorant Garamond', 'serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease forwards',
        'slide-up': 'slideUp 0.6s ease forwards',
        'slide-down': 'slideDown 0.3s ease forwards',
        'scale-in': 'scaleIn 0.4s ease forwards',
        'shimmer': 'shimmer 2s linear infinite',
        'float': 'float 3s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        fadeIn: { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp: { from: { opacity: '0', transform: 'translateY(30px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        slideDown: { from: { opacity: '0', transform: 'translateY(-10px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        scaleIn: { from: { opacity: '0', transform: 'scale(0.9)' }, to: { opacity: '1', transform: 'scale(1)' } },
        shimmer: { from: { backgroundPosition: '-200% 0' }, to: { backgroundPosition: '200% 0' } },
        float: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-10px)' } },
        glow: { from: { boxShadow: '0 0 20px rgba(212,130,30,0.3)' }, to: { boxShadow: '0 0 40px rgba(212,130,30,0.7)' } },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-luxury': 'linear-gradient(135deg, #1a1a1a 0%, #2d2410 50%, #1a1a1a 100%)',
        'gradient-gold': 'linear-gradient(135deg, #f5c842 0%, #d4821e 100%)',
      },
      boxShadow: {
        'luxury': '0 25px 50px -12px rgba(0,0,0,0.5)',
        'gold': '0 10px 30px rgba(212,130,30,0.3)',
        'inner-luxury': 'inset 0 2px 4px rgba(0,0,0,0.3)',
      }
    },
  },
  plugins: [],
}
