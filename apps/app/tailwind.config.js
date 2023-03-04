// tailwind config is required for editor support

var shared = require("tailwind-config/tailwind.config.js");
module.exports = {
  ...shared,
  darkMode: "class",
  content: [...shared.content, "./app/**/*.{js,ts,jsx,tsx}"],
  plugins: [
    require("@tailwindcss/forms"),
    require("@tailwindcss/container-queries"),
    require("@headlessui/tailwindcss"),
  ],
};
