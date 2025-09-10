'use client';

import { useEffect, useState } from 'react';
import { fetchWithAuth } from '@/lib/fetchWithAuth';
import { cn, getCurrentUser, handleFetchError, removeCurrentUser } from '@/lib/helpers';
import { logger } from '@/lib/logger';
import { GameSession, GameSessionsResponse, User } from '@/types';
import { useRouter } from 'next/navigation';
import nProgress, { set } from 'nprogress';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const Lobby = () => {
	const router = useRouter();
	const [user, setUser] = useState<User | null>(null);
	const [loggingOut, setLoggingOut] = useState(false);
	const [searchignNewGame, setSearchignNewGame] = useState(true);
	const [startingSession, setStartingSession] = useState(false);
	const [currentSession, setCurrentSession] = useState<GameSession | null>(null);
	const [activeSession, setActiveSession] = useState<boolean>(false);
	const [joiningSession, setJoiningSession] = useState<boolean>(false);
	const [countdown, setCountdown] = useState<number | null>(null);
	const [error, setError] = useState('');

	useEffect(() => {
		const currentUser = getCurrentUser();
		if (!currentUser) {
			logger.error('No current user found, redirecting to auth');
			logoutUser();
		} else {
			setUser(currentUser);
		}
	}, []);

	const logoutUser = async () => {
		setLoggingOut(true);
		try {
			const response = await fetchWithAuth('api/auth/logout');
			if (response.ok) {
				removeCurrentUser();
				nProgress.start();
				logger.log('Logout successful');
				router.push('/auth');
			}
		} catch (err) {
			logger.error('Logout failed', err);
			router.push('/auth');
			setLoggingOut(false);
		}
	};

	const handleNewGame = async () => {
		setError('');
		if (!currentSession) {
			setStartingSession(true);
			try {
				const request = await fetchWithAuth('api/games/new-game', { method: 'POST' });
				const response = (await request.json()) as GameSessionsResponse;
				handleFetchError(response, request);

				if (request.ok && response.game) {
					nProgress.start();
					router.push('/game');
				} else {
					logger.error('Failed to start new game session', response);
					setError(response.error || 'Failed to start new game session');
					setStartingSession(false);
					if (response.game) {
						setCurrentSession(response.game);
						setActiveSession(true);
					}
				}
			} catch (err) {
				logger.error('Error while starting new game session', err);
				setError('Error while starting new game session');
				setStartingSession(false);
			}
		} else {
			setJoiningSession(true);
			try {
				const request = await fetchWithAuth('api/games/join-game', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({ game_id: currentSession.id }),
				});

				const response = (await request.json()) as GameSessionsResponse;

				if (request.ok && response.game) {
					nProgress.start();
					router.push('/game');
				} else {
					logger.error(`Failed to join the session`, response);
					setError(response.error || 'Failed to join the session, please try again later');
					setJoiningSession(false);
				}
			} catch (error: any) {
				logger.error(`Error while joining the session`, error);
				setError('An error occurred while joining the session, please try again later');
				setJoiningSession(false);
			}
		}
	};

	useEffect(() => {
		let channel: any;
		let reconnectionTimeout: NodeJS.Timeout | null = null;

		logger.log('Supabase realtime debug — URL and anon key present?', {
			supabaseUrl: !!supabaseUrl,
			supabaseAnonKey: !!supabaseAnonKey,
		});

		const subscribe = () => {
			logger.log('Subscribing to game_sessions channel');
			channel = supabase.channel(`games-session`);

			channel.on(
				'postgres_changes',
				{
					event: 'INSERT',
					schema: 'public',
					table: 'game_sessions',
				},
				(payload: { new: GameSession }) => {
					setCurrentSession(payload.new);
				}
			);

			try {
				(channel.subscribe as any)((status: any) => {
					logger.log('Subscribe status:', status);
					if (status === 'closed' || (status?.type === 'CHANNEL_STATE' && status?.status === 'closed')) {
						logger.log('Channel reported closed, scheduling reconnect in 2s');
						reconnectionTimeout = setTimeout(() => subscribe(), 2000);
					}
				});
			} catch (err) {
				logger.error('Error while subscribing to channel', err);
				reconnectionTimeout = setTimeout(() => subscribe(), 2000);
			}
		};

		subscribe();
		return () => {
			if (channel) channel.unsubscribe();
			if (reconnectionTimeout) clearTimeout(reconnectionTimeout);
		};
	}, []);

	useEffect(() => {
		const cleanup = handleNewSession(currentSession);
		return cleanup;
	}, [currentSession]);

	const getActiveGames = async () => {
		try {
			const request = await fetchWithAuth('api/games/active');
			const response = (await request.json()) as GameSessionsResponse;
			handleFetchError(response, request);

			logger.log('Fetched active games', response);
			if (request.ok && response.game) {
				setCurrentSession(response.game);
			}
		} catch (err) {
		} finally {
			setSearchignNewGame(false);
		}
	};

	useEffect(() => {
		getActiveGames();
	}, []);

	const handleNewSession = (session: GameSession | null = null) => {
		if (session == null) return;

		setActiveSession(true);
		const now = new Date();
		const currentTime = new Date(new Date(session.created_at).getTime() + session.session_duration * 1000);

		const secondsLeft = Math.floor((currentTime.getTime() - now.getTime()) / 1000);
		if (secondsLeft < 1) {
			logger.log('Session already ended');
			setActiveSession(false);
			return;
		}
		setCountdown(secondsLeft);

		let timer: ReturnType<typeof setInterval> | null = null;
		timer = setInterval(() => {
			setCountdown((prev) => {
				if (prev == null) return null;
				if (prev <= 1) {
					setActiveSession(false);
					if (timer) clearInterval(timer);
					return 0;
				}
				return prev - 1;
			});
		}, 1000);

		return () => {
			if (timer) clearInterval(timer);
		};
	};

	return (
		<div className="flex flex-col h-screen w-screen bg-gray-200">
			{user ? (
				<>
					<nav className="self-end flex gap-4 items-center">
						<p>
							Hello, <span className="font-bold capitalize">{user?.username}</span>
						</p>
						<button onClick={logoutUser} className={cn(`hover:bg-red-600 bg-red-400 text-white px-4 py-2 rounded cursor-pointer ${loggingOut ? 'opacity-50 cursor-not-allowed' : ''}`)} disabled={loggingOut}>
							{loggingOut ? 'Logging Out...' : 'Log Out'}
						</button>
					</nav>

					<main className="flex-grow flex flex-col justify-center items-center">
						{error && (
							<div className="p-2 bg-red-400 text-white rounded-sm mb-4">
								<p>{error}</p>
							</div>
						)}
						<h1 className="text-4xl font-bold mb-4">Welcome to the Game Page</h1>
						<h2>
							Total wins: <span>{user?.total_wins}</span>
						</h2>
						<h2>
							Total Losses: <span>{user?.total_losses}</span>
						</h2>

						<div className="flex flex-col gap-4 mt-8 items-center">
							<button type="button" className={cn(`cursor-pointer text-white bg-black p-5 px-20 ${(searchignNewGame || startingSession || joiningSession) && 'opacity-50'}`)} onClick={handleNewGame} disabled={searchignNewGame || startingSession}>
								{searchignNewGame ? 'Loading...' : activeSession ? (joiningSession ? 'Joining...' : 'Join') : startingSession ? 'Starting Session...' : 'Start Session'}
							</button>
							{activeSession == true && countdown && <span className="text-red-500">There is an active session, you can join in {countdown}s</span>}
						</div>
					</main>
				</>
			) : (
				<main className="flex-grow flex flex-col justify-center items-center">
					<h1 className="text-xl font-bold mb-4">Loading...</h1>
				</main>
			)}
		</div>
	);
};

export default Lobby;
