import { cn } from '@/lib/helpers';
import { useRouter } from 'next/navigation';
import nProgress from 'nprogress';

const Default = () => {
	const router = useRouter();
	return (
		<main className="flex-grow flex flex-col justify-center items-center">
			<h1 className="text-xl font-bold mb-4">No Active Session</h1>
			<div className="flex flex-col gap-4 mt-8 items-center">
				<button
					onClick={() => {
						nProgress.start();
						router.push('/lobby');
					}}
					className={cn(`cursor-pointer text-white bg-black p-5 px-20 `)}
				>
					Back To Lobby
				</button>
			</div>
		</main>
	);
};

export default Default;
