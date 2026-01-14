export default {
  plugins: {
    "@tailwindcss/postcss": {},
    autoprefixer: {
      grid: true,
      cascade: false,
    },
    "css-declaration-sorter": {
      order: "smacss",
    },
    "postcss-sort-media-queries": {
      sort: "mobile-first",
    },
  },
};
