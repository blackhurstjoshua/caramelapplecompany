/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      colors: {
        'apple-light': '#B8D68C',
        'apple-medium': '#8FBC5A',
        'apple-dark': '#6B9B37',
      },
    },
  },
  plugins: [require('daisyui')],
}