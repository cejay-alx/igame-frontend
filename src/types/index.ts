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

export interface GameSession {
	id: string;
	session_date: string;
	winning_number: number | null;
	status: 'waiting' | 'active' | 'finished';
	max_players: number;
	current_players: number;
	session_duration: number;
	created_at: string;
	started_at: string;
	ended_at: string;
}

export interface GameSessionsResponse {
	game?: GameSession | null;
	error?: string | null;
}
