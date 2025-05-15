/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['i.imgur.com'],
  },
  // Simplified webpack config to fix module resolution issues
  webpack: (config) => {
    // Fix for "exports is not defined" error
    config.output.globalObject = 'globalThis';
    
    return config;
  },
  // Increase timeout for page loading
  staticPageGenerationTimeout: 180,
  // Set output to server mode to avoid static page generation issues
  output: 'standalone',
}

module.exports = nextConfig