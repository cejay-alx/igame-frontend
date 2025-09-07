'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import Nprogress from 'nprogress';
import 'nprogress/nprogress.css';

const ProgressBar = () => {
	const pathname = usePathname();
	const searchParams = useSearchParams();
	useEffect(() => {
		Nprogress.done();
	}, [pathname, searchParams]);
	return null;
};

export default ProgressBar;
