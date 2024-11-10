/** @type {import('next').NextConfig} */
const nextConfig = {
    webpack: (config) => {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        encoding: false,
        "pino-pretty": false,
      };
      return config;
    },
  }
  
  module.exports = nextConfig