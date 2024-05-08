/** @type {import('tailwindcss').Config} */
module.exports = {
  mode: 'jit',
  prefix: 'tw-',
  darkMode: ['class', '[class="dark"]'],
  corePlugins: {
    preflight: false
  },
  content: [
    "./index.html",
    "./src/**/*.{html,js,vue,ts}"
  ],
  theme: {
    extend: {
      backgroundImage: {
        'radial-gradient': 'radial-gradient(50% 50% at 50% 50%, rgba(0, 237, 255, 0.26) 0%, rgba(0, 237, 255, 0) 100%)'
      }
    },
    screens: {
      'sm': {'min': '320px', 'max': '767px'},
      'md': {'min': '768px', 'max': '1279px'},
      'lg': {'min': '1280px', 'max': '1439px'},
      'min-lg': {'min': '1280px'},
      'max-lg': {'max': '1279px'},
      'xl': {'min': '1440px'}
    },
    colors: {
      'white': 'var(--white)',
      'black': 'var(--black)',
      'light': 'var(--light)',
      'light-panel': 'var(--light-panel)',
      'dark': 'var(--dark)',
      'dark-panel': 'var(--dark-panel)',
      'gray-light': 'var(--gray-light)',
      'gray-mid': 'var(--gray-mid)',
      'gray': 'var(--gray)',
      'gray-dark': 'var(--gray-dark)',
      'gray-extra-dark': 'var(--gray-extra-dark)',
      'blue-primary': 'var(--blue-primary)',
      'blue-primary-hover': 'var(--blue-primary-hover)',
      'blue-primary-active': 'var(--blue-primary-active)',
      'sky': 'var(--sky)',
      'green': 'var(--green)',
      'orange': 'var(--orange)',
      'red': 'var(--red)'
    }
  },
  plugins: [
    {
      tailwindcss: {},
      autoprefixer: {},
    },
  ],
}