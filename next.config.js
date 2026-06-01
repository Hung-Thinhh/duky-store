/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  /* Allow builds in restricted environments */
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "4000",
      },
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: "/tu-khoa-san-pham/:path*",
        destination: "/",
        permanent: true,
      },
      {
        source: "/danh-muc-san-pham/:path*",
        destination: "/",
        permanent: true,
      },
      {
        source: "/san-pham/:path*",
        destination: "/",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
