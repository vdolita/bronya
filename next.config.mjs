const mode = process.env.BUILD_MODE ?? "standalone";


/** @type {import('next').NextConfig} */
const nextConfig = {
    poweredByHeader: false,
    output: mode
}

export default nextConfig
