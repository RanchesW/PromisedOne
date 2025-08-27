/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        'fantasy': ['Cinzel', 'serif'],
        'sans': ['Inter', 'sans-serif'],
      },
      colors: {
        primary: {
          50: '#fef7ed',
          100: '#fdf2d5',
          200: '#fae4aa',
          300: '#f6d074',
          400: '#f2b93c',
          500: '#ea580c',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
        secondary: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        },
      },
      animation: {
        'glow': 'glow 2s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
        'fade-in': 'fadeIn 0.5s ease-out',
      },
      keyframes: {
        glow: {
          '0%, 100%': {
            textShadow: '0 0 5px rgba(217, 119, 6, 0.5)',
          },
          '50%': {
            textShadow: '0 0 20px rgba(217, 119, 6, 0.8)',
          },
        },
        float: {
          '0%, 100%': {
            transform: 'translateY(0px)',
          },
          '50%': {
            transform: 'translateY(-10px)',
          },
        },
        fadeIn: {
          from: {
            opacity: '0',
            transform: 'translateY(10px)',
          },
          to: {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
      },
      animationDelay: {
        '200': '200ms',
        '400': '400ms',
      },
      boxShadow: {
        'glow': '0 0 20px rgba(217, 119, 6, 0.3)',
        'glow-lg': '0 0 40px rgba(217, 119, 6, 0.4)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'parchment': `
          radial-gradient(circle at 20% 50%, rgba(120, 119, 198, 0.1) 0%, transparent 50%),
          radial-gradient(circle at 80% 20%, rgba(255, 206, 84, 0.1) 0%, transparent 50%),
          radial-gradient(circle at 40% 80%, rgba(120, 119, 198, 0.1) 0%, transparent 50%)
        `,
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}
