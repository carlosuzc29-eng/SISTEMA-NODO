import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    agentUpgrade: "security",
  },
};

export default nextConfig;
