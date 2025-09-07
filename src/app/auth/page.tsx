'use client';

import { fetchWithAuth } from '@/lib/fetchWithAuth';
import { validateLoginInput } from '@/lib/helpers';
import { logger } from '@/lib/logger';

const Auth = () => {
	const login = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		logger.log(`Submitting login form`);
		const validation = validateLoginInput('test');
		if (validation.status) {
			const response = await fetchWithAuth('api/auth/login', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ username: 'test' }),
			});

			logger.log(response);
		} else {
			logger.error(validation.message);
		}
	};

	const logout = async () => {
		const response = await fetchWithAuth('api/auth/logout');
		logger.log(response);
	};
	return (
		<div className="flex h-screen w-screen justify-center items-center bg-gray-200">
			<div className="bg-white p-10 rounded-2xl">
				<h1 className="">Login</h1>

				<form onSubmit={login} className="flex flex-col gap-5">
					<input type="text" className="border" />
				</form>

				<p className="text-gray-700 cursor-pointer" onClick={logout}>
					Logout
				</p>
			</div>
		</div>
	);
};

export default Auth;
