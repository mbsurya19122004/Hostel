/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#EFEDE6",
        card: "#FFFFFF",
        ink: "#1E2622",
        inkmute: "#5B6560",
        line: "#D9D5C8",
        mustard: "#E3A008",
        mustarkdark:"#B87F06",
        navy: "#1F3A5F",
        navydeep: "#152A45",
        brick: "#B23A2E",
        pine: "#2F6844",
      },
      fontFamily: {
        display: ["'Space Grotesk'", "sans-serif"],
        body: ["'Inter'", "sans-serif"],
      },
      borderRadius: {
        card: "10px",
        pass: "18px",
      },
    },
  },
  plugins: [],
}
