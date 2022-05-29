/** @type {import('next-i18next').UserConfig} */
const userConfig = {
  i18n: {
    defaultLocale: "en",
    locales: ["en", "sk"],
  },
  reloadOnPrerender: process.env.NODE_ENV === "development",
};

module.exports = userConfig;
