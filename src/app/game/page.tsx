'use client';

import { fetchWithAuth } from '@/lib/fetchWithAuth';
import { cn, getCurrentUser, handleFetchError, removeCurrentUser, setCurrentUser } from '@/lib/helpers';
import { logger } from '@/lib/logger';
import { EndGameSessionsResponse, GameSession, GameSessionsResponse, SessionParticipant, User } from '@/types';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import nProgress, { set } from 'nprogress';
import { useEffect, useLayoutEffect, useState } from 'react';
import SelectNumber from './SelectNumber';
import Default from './Default';
import Results from './Results';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const Game = () => {
	const router = useRouter();
	const [user, setUser] = useState<User | null>(null);
	const [countdown, setCountdown] = useState<number | null>(null);
	const [searchignNewGame, setSearchignNewGame] = useState(true);
	const [currentSession, setCurrentSession] = useState<GameSession | null>(null);
	const [count, setCount] = useState<number | null>(null);
	const [participant, setParticipant] = useState<SessionParticipant | null>(null);
	const [inGame, setInGame] = useState<boolean>(false);
	const [gameEnded, setGameEnded] = useState<boolean>(false);
	const [endingGame, setEndingGame] = useState<boolean>(false);
	const [activeSession, setActiveSession] = useState<boolean>(false);
	const [endGameResult, setEndGameResult] = useState<EndGameSessionsResponse | null>(null);
	const [luckyNumber, setLuckyNumber] = useState<number | null>(null);

	const logoutUser = async () => {
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
		}
	};

	useEffect(() => {
		const currentUser = getCurrentUser();
		if (!currentUser) {
			logoutUser();
		} else {
			setUser(currentUser);
		}
	}, []);

	const getActiveGames = async () => {
		try {
			const request = await fetchWithAuth('api/games/active');
			const response = (await request.json()) as GameSessionsResponse;

			handleFetchError(response, request);

			logger.log('Fetched active games', response);
			if (request.ok && response.game) {
				setCurrentSession(response.game);
				setCount(response.count || null);
				if (response.participant) {
					setParticipant(response.participant);
					if (response.participant.chosen_number) {
						setInGame(true);
					}
				}
			}
		} catch (err) {
		} finally {
			setSearchignNewGame(false);
		}
	};

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
					endGame();
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

	useEffect(() => {
		getActiveGames();

		let channel: any;
		let reconnectionTimeout: NodeJS.Timeout | null = null;

		logger.log('Supabase realtime debug — URL and anon key present?', {
			supabaseUrl: !!supabaseUrl,
			supabaseAnonKey: !!supabaseAnonKey,
		});

		const subscribe = () => {
			logger.log('Subscribing to session_participants channel');
			channel = supabase.channel(`session_participants-channel`);

			channel.on(
				'postgres_changes',
				{
					event: 'INSERT',
					schema: 'public',
					table: 'session_participants',
				},
				() => {
					setCount((prev) => (prev != null ? prev + 1 : 1));
				}
			);

			channel.on(
				'postgres_changes',
				{
					event: 'DELETE',
					schema: 'public',
					table: 'session_participants',
				},
				() => {
					setCount((prev) => (prev != null ? prev - 1 : prev));
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

	const endGame = async () => {
		setEndingGame(true);
		try {
			const request = await fetchWithAuth('api/games/end-game', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ game_id: currentSession?.id }),
			});
			const response = (await request.json()) as EndGameSessionsResponse;

			handleFetchError(response, request);

			if (request.ok) {
				if (response.participants) {
					const updatedParticipant = response.participants.find((p) => p.user?.username === user?.username);
					setCurrentUser(updatedParticipant?.user as User);
					setUser(updatedParticipant?.user as User);
				}
				setActiveSession(false);
				setGameEnded(true);
				setEndGameResult(response);
			}
		} catch (err: any) {}
	};

	return (
		<div className="flex h-screen w-screen bg-gray-200">
			{searchignNewGame ? (
				<main className="flex-grow flex flex-col justify-center items-center">
					<h1 className="text-xl font-bold mb-4">Loading...</h1>
				</main>
			) : (!activeSession && !(inGame && gameEnded)) || !participant ? (
				<Default />
			) : inGame && gameEnded && endGameResult ? (
				<Results data={endGameResult} luckyNumber={luckyNumber} />
			) : (
				<SelectNumber countdown={countdown} game={currentSession} inGame={inGame} setInGame={setInGame} count={count} participant={participant} endingGame={endingGame} luckyNumber={luckyNumber} setLuckyNumber={setLuckyNumber} />
			)}
		</div>
	);
};

export default Game;
