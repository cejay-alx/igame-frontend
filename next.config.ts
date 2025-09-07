import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
	allowedDevOrigins: ['frontend.local', '*.frontend.local'],
	async rewrites() {
		return [
			{
				source: '/api/:path*',
				destination: `${process.env.API_BASE_URL}/:path*`,
			},
		];
	},
};

export default nextConfig;
