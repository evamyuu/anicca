/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{ts,tsx}', './src/**/*.{ts,tsx}'],
  presets: [
    require('../../packages/config/tailwind.config.js'),
    require('nativewind/preset')
  ],
  plugins: [],
};