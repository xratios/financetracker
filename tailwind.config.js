/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      backgroundImage: {
        'gradient-orange': 'linear-gradient(135deg, #f97316 0%, #ea580c 50%, #c2410c 100%)',
        'gradient-orange-light': 'linear-gradient(135deg, #fdba74 0%, #fb923c 50%, #f97316 100%)',
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
}
