/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
    theme: {
      extend: {
        colors: {
          primario: "rgba(57, 75, 189, 1)",
          secundario: "rgba(0, 0, 0, 1)",
          terciario: "rgba(201, 201, 201, 1)",
          "brand-500": "#4F46E5"
        },
      },
    },
    plugins: [],
  }