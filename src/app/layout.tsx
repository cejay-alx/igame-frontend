import type { Metadata } from 'next';
import { Montserrat, Poppins } from 'next/font/google';
import ProgressBar from '@/components/ProgressBar';
import './globals.css';
import { Suspense } from 'react';

const poppins = Poppins({
	subsets: ['latin'],
	variable: '--font-poppins',
	weight: ['400', '500', '600', '700', '800', '900'],
	display: 'swap',
});

const montserrat = Montserrat({
	variable: '--font-montserrat',
	subsets: ['latin'],
});

export const metadata: Metadata = {
	title: 'IGame Assessment',
	description: 'IGame assessment submitted by Joseph Igwechu',
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body className={`${montserrat.variable} ${poppins.variable} antialiased`}>
				<Suspense>
					<ProgressBar />
					{children}
				</Suspense>
			</body>
		</html>
	);
}
