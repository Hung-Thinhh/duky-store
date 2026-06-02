/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  async redirects() {
    return [
      {
        source: "/products",
        destination: "/san-pham",
        permanent: true,
      },
      {
        source: "/products/:slug",
        destination: "/san-pham/:slug",
        permanent: true,
      },
      {
        source: "/tu-khoa-san-pham/:path*",
        destination: "/",
        permanent: true,
      },
      {
        source: "/bst/:slug",
        destination: "/:slug",
        permanent: true,
      },
      {
        source: "/collections/:slug",
        destination: "/:slug",
        permanent: true,
      },
      {
        source: "/login",
        destination: "/dang-nhap",
        permanent: true,
      },
      {
        source: "/signup",
        destination: "/dang-ky",
        permanent: true,
      },
      {
        source: "/user",
        destination: "/tai-khoan",
        permanent: true,
      },
      {
        source: "/user/:path*",
        destination: "/tai-khoan/:path*",
        permanent: true,
      },
    ];
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
};

export default nextConfig;
