/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    serverActions: false,
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Prevents bundling Node.js-only modules into the client bundle
      // This is necessary because Genkit/OpenTelemetry might have Node-specific imports
      
      // Explicitly alias Node.js built-ins to false for the client bundle
      config.resolve.alias = {
        ...config.resolve.alias,
        'async_hooks': false,
        'fs': false,
        'net': false,
        'tls': false,
        'child_process': false,
        'readline': false,
        'perf_hooks': false,
        'os': false,
        'path': false,
        'dns': false,
        'module': false,
        'string_decoder': false,
        'http': false,
        'https': false,
        'zlib': false,
        'stream': false,
        'crypto:': false,
      };

      config.resolve.fallback = {
        ...config.resolve.fallback,
        async_hooks: false,
        fs: false,
        path: false,
        os: false,
        net: false,
        tls: false,
        child_process: false,
        perf_hooks: false,
        dns: false,
        readline: false,
        module: false,
        string_decoder: false,
        http: false,
        https: false,
        zlib: false,
        stream: false,
        crypto: false,
      };
    }
    return config;
  },
};

export default nextConfig;
