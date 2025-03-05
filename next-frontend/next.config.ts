import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */

  // Enable static optimization for pages that don't use getServerSideProps or getStaticProps
  reactStrictMode: true,

  // API routes configuration
  async rewrites() {
    return [
      {
        // Proxy API requests to the backend
        source: "/api/backend/:path*",
        destination: "http://localhost:8000/api/v1/:path*",
      },
    ];
  },
};

export default nextConfig;
