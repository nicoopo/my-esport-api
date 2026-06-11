import type { NextConfig } from "next";

const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'cdn-api.pandascore.co',
            },
        ],
    },
    turbopack: {
        resolveExtensions: ['.tsx', '.ts', '.jsx', '.js'],
    },
}

export default nextConfig
