const withPWA = require("next-pwa")({
  dest: "public",
});

/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  images: {
    domains: ["cdn.discordapp.com", "media.discordapp.net", "mangatx.com", "i.imgur.com", "my1.1stkmgv1.com", "www.toggw.gg"],
  },
};

module.exports = withPWA(nextConfig);
