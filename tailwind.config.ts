/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      colors: {
        'apple-light': '#B8D68C',
        'apple-medium': '#8FBC5A',
        'apple-dark': '#6B9B37',
        'apple-red-light': '#F7DC6F',
        'apple-red-medium': '#E74C3C',
        'apple-red-dark': '#B71C1C',
        'cream': '#FFFFFE',
      },
      fontFamily: {
        'title': ['Oswald', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        'body': ['Roboto', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
    },
  },
  plugins: [require('daisyui')],
}