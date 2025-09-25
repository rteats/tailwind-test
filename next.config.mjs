/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'export',
    trailingSlash: true,
    images: {
        unoptimized: true
    },
    basePath: process.env.NODE_ENV === 'production' ? '/your-repo-name' : '', // Replace with your repo name
}

export default nextConfig;
