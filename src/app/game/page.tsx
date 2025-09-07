'use client';

import { fetchWithAuth } from '@/lib/fetchWithAuth';
import { removeCurrentUser } from '@/lib/helpers';
import { logger } from '@/lib/logger';
import { useRouter } from 'next/navigation';
import nProgress from 'nprogress';

const Game = () => {
	const router = useRouter();

	const logout = async () => {
		const response = await fetchWithAuth('api/auth/logout');
		if (response.ok) {
			removeCurrentUser();
			nProgress.start();
			logger.log('Logout successful');
			router.push('/auth');
		}
	};

	return (
		<div>
			Game
			<button onClick={logout}>Logout</button>
		</div>
	);
};

export default Game;
