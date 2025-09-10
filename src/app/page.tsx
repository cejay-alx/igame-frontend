'use client';

import { fetchWithAuth } from '@/lib/fetchWithAuth';
import { cn, handleFetchError } from '@/lib/helpers';
import { logger } from '@/lib/logger';
import { Leaderboard, LeaderboardResponse } from '@/types';
import { useRouter } from 'next/navigation';
import nProgress from 'nprogress';
import { useEffect, useState } from 'react';

export default function Home() {
	const [activeTab, setActiveTab] = useState('all-time');
	const [loadingLeaderBoard, setLoadingLeaderBoard] = useState(true);
	const [leaderBoard, setLeaderBoard] = useState<Leaderboard[]>([]);
	const [error, setError] = useState('');

	const router = useRouter();

	const fetchLeaderBoard = async (timeframe: string) => {
		setLoadingLeaderBoard(true);
		setLeaderBoard([]);
		setError('');
		try {
			const request = await fetchWithAuth(`/api/games/leaderboard/${timeframe}`);

			const response = (await request.json()) as LeaderboardResponse;
			handleFetchError(response, request);

			if (request.ok && response.players) {
				setLeaderBoard(response.players);
			} else {
				setError(response.error || 'Failed to fetch leaderboard');
			}
		} catch (err: any) {
			logger.error('Error fetching leaderboard', err);
			setError(err.message || 'An error occurred while fetching the leaderboard.');
		} finally {
			setLoadingLeaderBoard(false);
		}
	};

	useEffect(() => {
		fetchLeaderBoard(activeTab);
	}, [activeTab]);

	return (
		<div className="flex h-screen w-screen bg-gray-200 flex-col gap-4">
			<nav className="self-end flex gap-4 items-center">
				<button
					onClick={() => {
						nProgress.start();
						router.push('/lobby');
					}}
					className={cn(`hover:bg-blue-600 bg-blue-400 text-white px-4 py-2 rounded cursor-pointer `)}
				>
					Go To Lobby
				</button>
			</nav>

			<div className="flex-grow flex flex-col justify-center items-center">
				<div className="text-center space-y-3">
					<h1 className="text-black text-4xl font-bold">Welcome to iGame </h1>
					<span className="text-2xl">compete and win</span>
				</div>

				<div className="mt-10 text-center bg-white p-10 rounded-lg shadow-md w-full">
					{error && (
						<div className="p-2 bg-red-400 text-white rounded-sm mb-4">
							<p>{error}</p>
						</div>
					)}

					<div>
						<h3 className="text-3xl font-semibold">Leaderboard</h3>
						<span>Top players by number of wins</span>
					</div>

					<div className="flex flex-col items-center">
						<ul className="flex justify-center gap-2 mt-6 font-semibold text-md  w-fit bg-gray-400 rounded-lg overflow-clip p-1">
							<li className={`tab-style ${activeTab == 'all-time' && 'active-tab'}`} onClick={() => setActiveTab('all-time')}>
								All Time
							</li>
							<li className={`tab-style ${activeTab == 'today' && 'active-tab'}`} onClick={() => setActiveTab('today')}>
								Today
							</li>
							<li className={`tab-style ${activeTab == 'weekly' && 'active-tab'}`} onClick={() => setActiveTab('weekly')}>
								This Week
							</li>
							<li className={`tab-style ${activeTab == 'monthly' && 'active-tab'}`} onClick={() => setActiveTab('monthly')}>
								This Month
							</li>
						</ul>
					</div>

					{!loadingLeaderBoard ? (
						<ul className="mt-6 space-y-2 font-semibold text-lg">
							{leaderBoard.length > 0 ? (
								leaderBoard.map(({ username, total_wins }, i) => (
									<li key={i}>
										{i + 1}. {username} - {total_wins} wins
									</li>
								))
							) : (
								<li>No data available</li>
							)}
						</ul>
					) : (
						<div className="mt-10 flex flex-col items-center gap-2">
							<span className="loader"></span>
							<span className="text-base">Loading data...</span>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
