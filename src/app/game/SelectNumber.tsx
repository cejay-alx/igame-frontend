'use client';

import { fetchWithAuth } from '@/lib/fetchWithAuth';
import { cn } from '@/lib/helpers';
import { GameSession, GameSessionsResponse, SessionParticipant } from '@/types';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

interface SelectNumberProps {
	countdown: number | null;
	setInGame: (inGame: boolean) => void;
	inGame: boolean;
	count?: number | null;
	participant?: SessionParticipant | null;
	game?: GameSession | null;
	endingGame: boolean;
}

const SelectNumber = ({ countdown, setInGame, inGame, count, participant, game, endingGame }: SelectNumberProps) => {
	const inputRef = useRef<HTMLInputElement | null>(null);
	const [error, setError] = useState('');
	const [success, setSuccess] = useState('');
	const [submitting, setSubmitting] = useState(false);
	const [leaving, setLeaving] = useState(false);
	const [luckyNumber, setLuckyNumber] = useState<number | null>(null);

	const router = useRouter();

	const handleSubmit = async () => {
		const value = inputRef.current?.value;
		if (!value || isNaN(Number(value)) || Number(value) < 1 || Number(value) > 9) {
			setError('Please enter a valid number between 1 and 9');
			return;
		}

		setError('');
		setSubmitting(true);
		try {
			const request = await fetchWithAuth('api/games/set-number', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ chosen_number: Number(value), game_id: game?.id }),
			});

			const response = (await request.json()) as GameSessionsResponse;

			if (!request.ok) {
				setError(response.error || 'Failed to select number');
			}

			if (request.ok && response.game) {
				setLuckyNumber(Number(value));
				setInGame(true);
				setSuccess('Your lucky number was selected successfully');
			}
		} catch (err: any) {
			setError(err.message || 'Failed to select number');
		} finally {
			setSubmitting(false);
		}
	};

	const leaveGame = async () => {
		setLeaving(true);
		setError('');

		try {
			const request = await fetchWithAuth('api/games/leave-game', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ game_id: game?.id }),
			});

			const response = await request.json();

			if (!request.ok) {
				setError(response.error || 'Failed to leave game');
				setLeaving(false);
			} else {
				setSuccess('You left the game successfully.');
				router.push('/home');
			}
		} catch (error: any) {
			setError(error.message || 'Failed to leave game');
			setLeaving(false);
		}
	};

	useEffect(() => {
		if (participant?.chosen_number) {
			setLuckyNumber(participant?.chosen_number);
		}
	}, []);

	return (
		<div className="flex flex-col flex-grow h-screen w-screen">
			<nav className="self-end flex gap-4 items-center">
				<div className="flex items-center justify-center flex-col m-4">
					<h2 className="font-semibold text-xl">Countdown Timer</h2>
					<span className="font-semibold text-4xl">{countdown || 'Game Ended'}</span>
				</div>
			</nav>

			<main className="flex-grow flex flex-col justify-center items-center">
				{!endingGame && error && (
					<div className="p-2 px-4 bg-red-400 text-white rounded-sm mb-10">
						<p>{error}</p>
					</div>
				)}

				{!endingGame && success && (
					<div className="p-2 px-4 bg-green-400 text-white rounded-sm mb-10">
						<p>{success}</p>
					</div>
				)}

				<h3 className="font-semibold text-xl mb-2">{endingGame ? 'The game is ending, please wait...' : 'Pick a number from 1-9'}</h3>

				{!inGame ? <input type="number" max={9} min={1} ref={inputRef} className="p-5 w-3xl bg-white" /> : <h5 className="text-lg font-bold">{endingGame && `You have selected your number for this round`}</h5>}

				<div className="flex w-3xl gap-2">
					<button onClick={handleSubmit} className={cn(`bg-black text-white p-4 rounded-sm mt-4 w-full  ${submitting || inGame || endingGame ? 'opacity-50' : 'cursor-pointer'}`)} disabled={submitting || inGame || endingGame}>
						{submitting ? 'Submitting...' : inGame ? `Number Selected (${luckyNumber})` : 'Submit'}
					</button>

					{inGame && (
						<button onClick={leaveGame} className={cn(`bg-red-500 text-white p-4 rounded-sm mt-4 w-full  ${leaving || endingGame ? 'opacity-50' : 'cursor-pointer'}`)} disabled={leaving || endingGame}>
							{leaving ? 'Leaving Game...' : 'Leave Game'}
						</button>
					)}
				</div>

				{count && (
					<div className="mt-10">
						<p className="text-green-500 text-lg">{count} users joined.</p>
					</div>
				)}
			</main>
		</div>
	);
};

export default SelectNumber;
