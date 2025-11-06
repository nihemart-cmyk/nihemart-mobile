/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./globals.css",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#FF6B35",       // primaryOrange
        secondary: "#2DBBDD",     // primaryBlue
        background: "#FFFFFF",    // white
        surface: "#FFFFFF",       // white
        text: "#1A1A1A",          // darkGray
        textSecondary: "#6B7280", // mediumGray
        border: "#E5E7EB",
        success: "#10B981",
        warning: "#F59E0B",
        error: "#EF4444",
        white: "#FFFFFF",
        black: "#000000",

        light: {
          text: "#1A1A1A",
          background: "#FFFFFF",
          tint: "#FF6B35",
          tabIconDefault: "#6B7280",
          tabIconSelected: "#FF6B35",
          card: "#FFFFFF",
          border: "#E5E7EB",
        },

        dark: {
          text: "#ECEDEE",
          background: "#151718",
          tint: "#FFFFFF",
          icon: "#9BA1A6",
          tabIconDefault: "#9BA1A6",
          tabIconSelected: "#FFFFFF",
        },
      },

      fontFamily: {
        regular: ["Poppins-Regular"],
        medium: ["Poppins-Medium"],
        semiBold: ["Poppins-SemiBold"],
        // bold: ["Poppins-Bold"],

        sans: [
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "Helvetica",
          "Arial",
          "sans-serif",
        ],
        serif: ["Georgia", "Times New Roman", "serif"],
        mono: [
          "SFMono-Regular",
          "Menlo",
          "Monaco",
          "Consolas",
          "Liberation Mono",
          "Courier New",
          "monospace",
        ],
      },
    },
  },
  plugins: [],
};