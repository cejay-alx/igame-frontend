'use client';

import { fetchWithAuth } from '@/lib/fetchWithAuth';
import { setCurrentUser, validateLoginInput } from '@/lib/helpers';
import { logger } from '@/lib/logger';
import { LoginResponse } from '@/types';
import { useRouter, useSearchParams } from 'next/navigation';
import nProgress from 'nprogress';
import { useRef, useState } from 'react';

const Auth = () => {
	const inputRef = useRef<HTMLInputElement>(null);
	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState('');

	const router = useRouter();
	const searchParams = useSearchParams();

	const login = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setSubmitting(true);
		setError('');
		try {
			logger.log(`Submitting login form`);
			const username = inputRef.current?.value ?? '';
			const validation = validateLoginInput(username);

			if (validation.status) {
				const response = await fetchWithAuth('api/auth/login', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({ username }),
				});

				const data = (await response.json()) as LoginResponse;

				if (response.ok && data.user) {
					const redirectTo = searchParams.get('redirect_to');
					logger.log(`Redirect to param: ${redirectTo}`);
					let destination = '/lobby';

					logger.log(`Login successful for user: ${data.user.username}`);
					if (redirectTo && redirectTo.startsWith('/')) destination = redirectTo;

					nProgress.start();
					setCurrentUser(data.user);
					router.replace(destination);
				} else {
					setError(data.error || 'Login failed');
					logger.error(`Login failed: ${data.error || 'Unknown error'}`);
				}
			} else {
				logger.error(validation.message);
			}
		} catch (err) {
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<div className="flex h-screen w-screen justify-center items-center bg-gray-200">
			<div className="bg-white p-10 rounded-2xl">
				<h1 className="">Login</h1>

				<form onSubmit={login} className="flex flex-col gap-5">
					{error && (
						<div className="p-2 bg-red-400 text-white rounded-sm">
							<p>{error}</p>
						</div>
					)}
					<input type="text" className={`border ${submitting ? 'bg-gray-400 cursor-not-allowed' : ''}`} ref={inputRef} disabled={submitting} />
					<button type="submit" className={`cursor-pointer p-2 bg-blue-600 rounded-4xl ${submitting && 'opacity-50'}`} disabled={submitting}>
						{submitting ? 'Logging in...' : 'Login'}
					</button>
				</form>
			</div>
		</div>
	);
};

export default Auth;
