import path from "path";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,
  turbopack: {},
  // Compress responses
  compress: true,
  // Strict CSP-safe power features
  poweredByHeader: false,
  images: {
    // Modern formats reduce bandwidth ~30%
    formats: ["image/avif", "image/webp"],
    // Cache optimized images for 7 days
    minimumCacheTTL: 604800,
    remotePatterns: [
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "*.googleusercontent.com" },
      {
        protocol: "https",
        hostname: "daktarinfo.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "encrypted-tbn0.gstatic.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "doctorspedia.co",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "i.ibb.co.com",
        port: "",
        pathname: "/**",
      },
      { protocol: "https", hostname: "randomuser.me" },
      { hostname: "i.pravatar.cc", port: "", pathname: "/**" },
      { protocol: "https", hostname: "github.com", port: "", pathname: "/**" },
    ],
  },
  // Stable cache headers for static assets
  async headers() {
    return [
      {
        source: "/(.*\\.(?:js|css|woff2|png|jpg|jpeg|svg|ico|webp|avif))",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        // API routes: no client cache, server may cache
        source: "/api/(.*)",
        headers: [{ key: "Cache-Control", value: "no-store, max-age=0" }],
      },
    ];
  },
  webpack(config) {
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      "@": path.resolve(__dirname, "src"),
    };
    return config;
  },
};

export default nextConfig;
