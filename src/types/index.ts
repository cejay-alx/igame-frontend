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
	count?: number | null;
	participant?: SessionParticipant | null;
	error?: string | null;
}

export interface EndGameSessionsResponse {
	game?: GameSession | null;
	count?: number | null;
	participants?: SessionParticipant[] | null;
	error?: string | null;
}

export interface SessionParticipant {
	id: string;
	session_id: string;
	user_id: string;
	chosen_number: number;
	is_winner: boolean;
	joined_at: string;
	is_starter: boolean;
	updated_at: string;
	user: {
		total_wins?: number;
		total_losses?: number;
		username?: string;
	} | null;
}
