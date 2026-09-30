import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['jspdf', 'xlsx', 'jspdf-autotable'],
};

export default nextConfig;
