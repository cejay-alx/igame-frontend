import { cn } from '@/lib/helpers';
import { useRouter } from 'next/navigation';
import nProgress from 'nprogress';

const Default = () => {
	const router = useRouter();
	return (
		<main className="flex-grow flex flex-col justify-center items-center">
			<h1 className="text-xl font-bold mb-4">No Active Session</h1>
			<div className="flex flex-col gap-4 mt-8 items-center">
				<button className={cn(`cursor-pointer text-white bg-black p-5 px-20 `)} onClick={() => {}}>
					Start New Session
				</button>
				<span
					onClick={() => {
						nProgress.start();
						router.push('/home');
					}}
					className="cursor-pointer"
				>
					{'<	Go Back'}
				</span>
			</div>
		</main>
	);
};

export default Default;
