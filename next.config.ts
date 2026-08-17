import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Next 15 writes `dev` and `build` output to the same directory. Keep local
  // HMR isolated so a validation build cannot corrupt a running preview.
  distDir: process.env.NODE_ENV === 'development' ? '.next-dev' : '.next',
  // The desktop preview opens localhost builds through 127.0.0.1. Treat that
  // loopback hostname as trusted in development so Next.js can serve HMR and
  // internal assets without cross-origin warnings (or future blocking).
  allowedDevOrigins: ['127.0.0.1'],
  // The draggable Next.js dev badge can sit over PuffBreak's corner controls
  // and intercept clicks during local QA. Runtime errors still appear as the
  // full development overlay, so disabling only the badge keeps testing honest.
  devIndicators: false,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  // Allow access to remote image placeholder.
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**', // This allows any path under the hostname
      },
    ],
  },
  output: 'standalone',
  transpilePackages: ['motion'],
  webpack: (config, {dev}) => {
    // HMR is disabled in AI Studio via DISABLE_HMR env var.
    // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
    if (dev && process.env.DISABLE_HMR === 'true') {
      config.watchOptions = {
        ignored: /.*/,
      };
    }
    return config;
  },
};

export default nextConfig;
