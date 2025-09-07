import { NextRequest, NextResponse } from 'next/server';
import { logger } from './lib/logger';
import { fetchWithAuth } from './lib/fetchWithAuth';

const apiUrl = process.env.API_BASE_URL;

interface VerifyResult {
	user: string | null;
	error: string | null;
}

export async function middleware(request: NextRequest) {
	const { pathname } = request.nextUrl;
	const authToken = request.cookies.get('access_token')?.value;

	const gameUrl = new URL('/game', request.url);
	const authUrl = new URL('/auth', request.url);

	const isGamePath = pathname.startsWith('/game');
	const isAuthPath = pathname.startsWith('/auth');

	if (isGamePath) {
		if (!authToken) return redirect(authUrl, pathname, authToken);

		const { user, error } = await verifyUser(authToken);

		if (!user || error) {
			logger.error(`User verification failed: ${error}`);
			return redirect(authUrl, pathname, authToken);
		}
	}

	if (isAuthPath && authToken) {
		const { user, error } = await verifyUser(authToken);
		if (user && !error) {
			const redirect_to = request.nextUrl.searchParams.get('redirect_to');
			let targetPath: string | null = null;

			if (redirect_to) {
				try {
					const potentialUrl = new URL(redirect_to, request.nextUrl.origin);
					if (potentialUrl.origin == request.nextUrl.origin) {
						targetPath = potentialUrl.pathname;
						if (!(targetPath && targetPath.startsWith('/'))) targetPath = null;
					}
				} catch (error: unknown) {}
			}

			if (targetPath) {
				return NextResponse.redirect(new URL(targetPath, request.nextUrl.origin));
			} else {
				return NextResponse.redirect(new URL(gameUrl, request.nextUrl.origin));
			}
		}

		return NextResponse.next().cookies.delete('access_token');
	}

	return NextResponse.next();
}

async function verifyUser(token: string): Promise<VerifyResult> {
	if (!apiUrl) {
		const error = 'Middleware api url not configured.';
		logger.error(error);
		return { user: null, error };
	}

	if (!token) {
		const error = 'No auth token provided.';
		logger.error(error);
		return { user: null, error };
	}

	const headers = new Headers();
	headers.append('Cookie', `access_token=${token}`);

	try {
		const request = await fetchWithAuth(`${apiUrl}/auth/verify`, {
			headers,
		});

		if (!request.ok) {
			logger.error(`Failed to verify user. Status: ${request.status}`);
			return { user: null, error: `Failed to verify user. Status: ${request.status}` };
		}

		const response = await request.json();
		return { user: response.user || null, error: null };
	} catch (error: unknown) {
		logger.error(`Error during token verification`, error);
		return { user: null, error: 'Error during token verification' };
	}
}

async function redirect(authUrl: URL, pathname: string, token: string | undefined) {
	authUrl.searchParams.set('redirect_to', pathname);
	const redirect = NextResponse.redirect(authUrl);
	if (token) redirect.cookies.delete('access_token');
	return redirect;
}

export const config = {
	matcher: ['/auth/:path*', '/game/:path*'],
};
