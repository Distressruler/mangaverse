/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./pages/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: [
      {
        rosefighter: {
          primary: "#FFFFFF",
          secondary: "#FFFFFF",
          accent: "#FFFFFF",
          neutral: "#FFFFFF",
          "base-100": "#000000",
          info: "#FFFFFF",
          success: "#FFFFFF",
          warning: "#FFFFFF",
          error: "#FFFFFF",
        },
      },
      "emerald",
    ],
  },
};
