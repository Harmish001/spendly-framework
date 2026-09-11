/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable React strict mode for better dev warnings
  reactStrictMode: true,

  // Image domains (if you use Next.js Image optimization)
  images: {
    remotePatterns: [],
  },

  // Redirect old SPA routes → new App Router paths
  async redirects() {
    return [
      {
        source: "/monthlyAnalysis",
        destination: "/monthly-analysis",
        permanent: true,
      },
    ];
  },

  // Experimental: bundle server-only packages properly
  experimental: {
    serverComponentsExternalPackages: ["mongoose", "bcryptjs"],
  },
};

export default nextConfig;
