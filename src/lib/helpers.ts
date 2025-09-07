import { User } from '@/types';
import { logger } from './logger';

export const validateLoginInput = (input: string): { status: boolean; message: string | null } => {
	logger.log('validating input');
	if (!input || input.trim() === '') return { status: false, message: 'Input cannot be empty' };

	if (input.length < 3) return { status: false, message: 'Input must be at least 3 characters long' };

	if (input.length > 20) return { status: false, message: 'Input cannot be longer than 20 characters' };

	return { status: true, message: null };
};

export const setCurrentUser = (user: User): void => {
	if (typeof window == undefined) return;

	try {
		localStorage.setItem('current_user', JSON.stringify(user));
	} catch (err) {
		logger.error('Failed to set current user in localStorage', err);
	}
};

export const getCurrentUser = (): User | null => {
	if (typeof window == undefined) return null;

	try {
		const user = localStorage.getItem('current_user');
		if (user) return JSON.parse(user) as User;
	} catch (err) {
		logger.error('Failed to get current user from localStorage', err);
	} finally {
		return null;
	}
};

export const removeCurrentUser = (): void => {
	if (typeof window == undefined) return;
	try {
		localStorage.removeItem('current_user');
	} catch (err) {
		logger.error('Failed to remove current user from localStorage', err);
	}
};
