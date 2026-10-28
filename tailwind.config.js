/** @type {import('tailwindcss').Config} */

const token = (name) => `rgb(var(--${name}) / <alpha-value>)`;

module.exports = {
  darkMode: 'media',
  content: ['./src/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,ts,tsx}'],

  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        header: {
          DEFAULT: token('header'),
          foreground: token('header-foreground'),
        },
        background: token('background'),
        surface: token('surface'),
        border: token('border'),
        foreground: token('foreground'),
        muted: token('muted'),
        primary: {
          DEFAULT: token('primary'),
          soft: token('primary-soft'),
          tint: token('primary-tint'),
          foreground: token('primary-foreground'),
        },
        strong: token('strong'),
        danger: token('danger'),
      },
    },
  },
  plugins: [],
};
