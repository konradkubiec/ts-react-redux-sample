'use client';
import { ApiService } from './api';

export interface AuthService {
	register: (userData: { name: string; email: string; password: string }) => Promise<{ userId: number }>;
	login: (credentials: { email: string; password: string }) => Promise<{ token: string }>;
	getUserDetails: (token: string) => Promise<{ user: { id: number; name: string; email: string } }>;
}

export class ApiAuthService implements AuthService {
	constructor(private api: ApiService) {}

	async register(userData: { name: string; email: string; password: string }) {
		return this.api.post('/user/register', userData);
	}

	async login(credentials: { email: string; password: string }) {
		return this.api.post('/user/login', credentials);
	}

	async getUserDetails(token: string) {
		return this.api.get('/user', { headers: { Authorization: `Bearer ${token}` } });
	}
}
