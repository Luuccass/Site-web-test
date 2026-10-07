import type { NextConfig } from "next";

// Static export: the site is plain HTML/CSS/JS served by Netlify's CDN (free plan, no server).
// Booking requests go through Netlify Forms; redirects and headers live in netlify.toml.
const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: {
    loader: "custom",
    loaderFile: "./src/lib/image-loader.ts",
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
