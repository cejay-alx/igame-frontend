import { logger } from './logger';

export const validateLoginInput = (input: string): { status: boolean; message: string | null } => {
	logger.log('validating input');
	if (!input || input.trim() === '') return { status: false, message: 'Input cannot be empty' };

	if (input.length < 3) return { status: false, message: 'Input must be at least 3 characters long' };

	if (input.length > 20) return { status: false, message: 'Input cannot be longer than 20 characters' };

	return { status: true, message: null };
};
