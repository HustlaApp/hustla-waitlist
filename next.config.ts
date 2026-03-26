import type { NextConfig } from "next";

const defaultAllowedDevOrigins = ["192.168.118.67", "172.20.10.3"];
const envAllowedDevOrigins = (process.env.ALLOWED_DEV_ORIGINS ?? "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    ...new Set([...defaultAllowedDevOrigins, ...envAllowedDevOrigins]),
  ],
};

export default nextConfig;
