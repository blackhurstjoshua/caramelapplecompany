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
  daisyui: {
    themes: [
      {
        light: {
          ...require("daisyui/src/theming/themes")["light"],
          // Override default text colors to be black
          "base-content": "#1f2937", // gray-800 - main text color
          "neutral-content": "#1f2937", // gray-800 - neutral text color
        },
      },
    ],
    base: true,
    styled: true,
    utils: true,
  },
}