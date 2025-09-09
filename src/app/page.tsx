'use client';

import { fetchWithAuth } from '@/lib/fetchWithAuth';
import { cn, handleFetchError } from '@/lib/helpers';
import { useRouter } from 'next/navigation';
import nProgress from 'nprogress';
import { useEffect, useState } from 'react';

export default function Home() {
	const [activeTab, setActiveTab] = useState('All Time');
	const [loadingLeaderBoard, setLoadingLeaderBoard] = useState(true);
	const [leaderBoard, seLeaderBoard] = useState([]);

	const router = useRouter();

	const fetchLeaderBoard = async (timeframe: string) => {
		setLoadingLeaderBoard(true);

		const request = await fetchWithAuth(`/api/game/leaderboard?timeframe=${encodeURIComponent(timeframe)}`);

		const response = await request.json();
		handleFetchError(response, request);

		if (request.ok) {
			// Process and set leaderboard data here
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
						router.push('/home');
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

				{!loadingLeaderBoard ? (
					<div className="mt-10 text-center bg-white p-10 rounded-lg shadow-md w-full">
						<div>
							<h3 className="text-3xl font-semibold">Leaderboard</h3>
							<span>Top players by number of wins</span>
						</div>

						<div className="flex flex-col items-center">
							<ul className="flex justify-center gap-2 mt-6 font-semibold text-md  w-fit bg-gray-400 rounded-lg overflow-clip p-1">
								<li className={`tab-style ${activeTab == 'All Time' && 'active-tab'}`} onClick={() => setActiveTab('All Time')}>
									All Time
								</li>
								<li className={`tab-style ${activeTab == 'Today' && 'active-tab'}`} onClick={() => setActiveTab('Today')}>
									Today
								</li>
								<li className={`tab-style ${activeTab == 'This Week' && 'active-tab'}`} onClick={() => setActiveTab('This Week')}>
									This Week
								</li>
								<li className={`tab-style ${activeTab == 'This Month' && 'active-tab'}`} onClick={() => setActiveTab('This Month')}>
									This Month
								</li>
							</ul>
						</div>

						<ul className="mt-6 space-y-2 font-semibold text-lg">
							<li>1. user1 - 10 wins</li>
							<li>2. user2 - 8 wins</li>
							<li>3. user3 - 5 wins</li>
						</ul>
					</div>
				) : (
					<div className="mt-10 flex flex-col items-center gap-2">
						<span className="loader"></span>
						<span className="text-xl">Loading Leaderboard Data...</span>
					</div>
				)}
			</div>
		</div>
	);
}
