/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary': '#9D5CFF',
        'primary-light': '#B388FF',
        'background': '#000000',
        'surface': '#111111',
        'surface-hover': '#1a1a1a',
        'text': '#FFFFFF',
        'text-muted': '#BDBDBD',
      },
      backgroundImage: {
        'gradient-purple': 'linear-gradient(135deg, #9D5CFF 0%, #B388FF 100%)',
        'gradient-dark': 'linear-gradient(135deg, #000000 0%, #111111 100%)',
      },
      boxShadow: {
        'glow-purple': '0 0 20px rgba(157, 92, 255, 0.5)',
        'glow-purple-lg': '0 0 40px rgba(157, 92, 255, 0.6)',
        'glow-purple-xl': '0 0 60px rgba(157, 92, 255, 0.7)',
      },
      backdropFilter: {
        'glass': 'blur(10px)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'typing': 'typing 3.5s steps(40, end)',
        'fade-in': 'fadeIn 0.5s ease-in-out',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(157, 92, 255, 0.5)' },
          '50%': { boxShadow: '0 0 40px rgba(157, 92, 255, 0.8)' },
        },
        typing: {
          '0%': { width: '0' },
          '100%': { width: '100%' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      transitionDuration: {
        '2000': '2000ms',
      },
    },
  },
  plugins: [],
}
