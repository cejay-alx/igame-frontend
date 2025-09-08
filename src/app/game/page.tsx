'use client';

import { fetchWithAuth } from '@/lib/fetchWithAuth';
import { cn, getCurrentUser, removeCurrentUser } from '@/lib/helpers';
import { logger } from '@/lib/logger';
import { GameSession, GameSessionsResponse, SessionParticipant, User } from '@/types';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import nProgress, { set } from 'nprogress';
import { useEffect, useLayoutEffect, useState } from 'react';
import SelectNumber from './SelectNumber';
import Default from './Default';

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
	const [activeSession, setActiveSession] = useState<boolean>(false);

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

	useLayoutEffect(() => {
		const currentUser = getCurrentUser();
		if (!currentUser) {
			logoutUser();
			router.push('/auth');
		} else {
			setUser(currentUser);
		}
	}, []);

	const getActiveGames = async () => {
		try {
			const request = await fetchWithAuth('api/games/active');
			const response = (await request.json()) as GameSessionsResponse;

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

	useEffect(() => {
		getActiveGames();
	}, []);

	useEffect(() => {
		handleNewSession(currentSession);
	}, [currentSession]);

	return (
		<div className="flex h-screen w-screen bg-gray-200">
			{searchignNewGame ? (
				<main className="flex-grow flex flex-col justify-center items-center">
					<h1 className="text-xl font-bold mb-4">Loading...</h1>
				</main>
			) : !activeSession ? (
				<Default />
			) : (
				<SelectNumber countdown={countdown} game={currentSession} inGame={inGame} setInGame={setInGame} count={count} participant={participant} />
			)}
		</div>
	);
};

export default Game;
