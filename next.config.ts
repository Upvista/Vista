import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
};

// Only apply PWA config in production
// For Vercel/deployment: Use webpack mode explicitly
if (process.env.NODE_ENV === 'production') {
  const withPWA = require('next-pwa')({
    dest: 'public',
    register: true,
    skipWaiting: true,
    disable: false,
    buildExcludes: [/middleware-manifest.json$/],
  });
  
  module.exports = withPWA(nextConfig);
} else {
  module.exports = nextConfig;
}

export default nextConfig;
