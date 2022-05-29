const { i18n } = require("./next-i18next.config");
const { InjectManifest } = require("workbox-webpack-plugin");

/** @type {import('next').NextConfig} */
const nextConfig = {
  i18n,
  reactStrictMode: true,
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    if (!isServer) {
      config.plugins.push(
        new InjectManifest({
          swSrc: "./sw.ts",
          swDest: "../public/sw.js",
          include: ["__nothing__"],
        })
      );
    }

    return config;
  },
};

module.exports = nextConfig;
