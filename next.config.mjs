/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverActions: {
      bodySizeLimit: "5mb",
    },
    optimizePackageImports: ["lucide-react"],
  },
  serverExternalPackages: ["@react-pdf/renderer"],
};

export default nextConfig;
