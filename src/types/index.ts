export interface User {
	username: string;
	total_wins: number;
	total_losses: number;
}

export interface LoginResponse {
	user?: User | null;
	error?: string | null;
	message?: string;
}
