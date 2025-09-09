'use client';

import { cn } from '@/lib/helpers';
import { EndGameSessionsResponse } from '@/types';
import { useEffect, useState } from 'react';

const Results = ({ data }: { data: EndGameSessionsResponse }) => {
	const [success, setSuccess] = useState('');
	const [startingSession, setStartingSession] = useState(false);
	const [joiningSession, setJoiningSession] = useState<boolean>(false);
	const [activeSession, setActiveSession] = useState<boolean>(false);

	const { participants, game, error } = data;

	useEffect(() => {
		if (!error) {
			setSuccess('Game ended successfully');
		}
	}, []);

	return (
		<div className="flex flex-col lg:flex-row h-screen w-screen bg-gray-200">
			<section className="bg-gray-400 flex-grow flex flex-col justify-center items-center">
				<h1 className="text-2xl font-semibold text-green-700">Active User's In Session</h1>

				<div className="space-y-3 mt-10 text-center text-xl">
					{participants && participants.length === 0 ? (
						<p className="mt-4">No participants in this game.</p>
					) : (
						participants?.map((participant, i) => {
							if (participant.is_starter)
								return (
									<div key={i} className="flex items-center justify-center space-x-2">
										<svg className="w-5 h-5 text-yellow-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" role="img" aria-label="first user">
											<path d="M12 .587l3.668 7.431 8.2 1.192-5.934 5.787 1.402 8.172L12 18.897l-7.336 3.869 1.402-8.172L.132 9.21l8.2-1.192z" />
										</svg>
										<p className="font-medium">
											{participant.user?.username} <span className="text-sm text-gray-600">(Starter)</span>
										</p>
									</div>
								);
							return <p key={i}>{participant.user?.username}</p>;
						})
					)}
				</div>
			</section>

			<section className="bg-gray-300 flex-grow flex flex-col justify-center items-center">
				{error && (
					<div className="p-2 px-4 bg-red-400 text-white rounded-sm mb-10">
						<p>{error}</p>
					</div>
				)}

				{success && (
					<div className="p-2 px-4 bg-green-400 text-white rounded-sm mb-10">
						<p>{success}</p>
					</div>
				)}

				<h1 className="text-2xl font-semibold text-center my-4">Game Results (Winning Number)</h1>
				<h2 className="text-9xl mt-4">{game?.winning_number}</h2>
				<div className="mt-10 text-center text-xl space-y-3">
					<p>Total Players {participants?.length || 0}</p>
					<p>Total Wins {participants?.filter((participant) => participant.is_winner).length || 0}</p>
				</div>

				<div className="flex flex-col gap-4 mt-8 items-center">
					<button type="button" className={cn(`cursor-pointer text-white bg-black p-5 px-20`)}>
						{activeSession ? (joiningSession ? 'Joining...' : 'Join') : startingSession ? 'Starting New Session...' : 'Start Session'}
					</button>
				</div>
			</section>

			<section className="bg-gray-400 flex-grow flex flex-col justify-center items-center">
				<h1 className="text-2xl font-semibold text-green-700">Winners</h1>

				<div className="space-y-3 mt-10 text-center text-xl">
					{participants && participants?.filter((participant) => participant.is_winner).length === 0 ? (
						<p className="mt-4">No winners in this round.</p>
					) : (
						participants
							?.filter((participant) => participant.is_winner)
							.map((participant, i) => {
								return <p key={i}>{participant.user?.username}</p>;
							})
					)}
				</div>
			</section>
		</div>
	);
};

export default Results;
