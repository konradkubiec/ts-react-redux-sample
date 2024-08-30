'use client';
import {describe, expect, test, it, jest, beforeEach} from '@jest/globals';
// File: /src/services/__tests__/auth.test.ts
import { ApiAuthService } from '@/services/auth';
import { ApiService } from '@/services/api';

describe('ApiAuthService', () => {
	let mockApiService: jest.Mocked<ApiService>;
	let authService: ApiAuthService;

	beforeEach(() => {
		mockApiService = {
			post: jest.fn(),
			get: jest.fn(),
		};
		authService = new ApiAuthService(mockApiService);
	});

	describe('register', () => {
		it('should call the register endpoint with user data', async () => {
			const userData = { name: 'Test User', email: 'test@example.com', password: 'password123' };
			const expectedResponse = { userId: 1 };
			mockApiService.post.mockResolvedValue(expectedResponse);

			const result = await authService.register(userData);

			expect(mockApiService.post).toHaveBeenCalledWith('/user/register', userData);
			expect(result).toEqual(expectedResponse);
		});
	});

	describe('login', () => {
		it('should call the login endpoint with credentials', async () => {
			const credentials = { email: 'test@example.com', password: 'password123' };
			const expectedResponse = { token: 'fake-jwt-token' };
			mockApiService.post.mockResolvedValue(expectedResponse);

			const result = await authService.login(credentials);

			expect(mockApiService.post).toHaveBeenCalledWith('/user/login', credentials);
			expect(result).toEqual(expectedResponse);
		});
	});

	describe('getUserDetails', () => {
		it('should call the user endpoint with the provided token', async () => {
			const token = 'fake-jwt-token';
			const expectedResponse = { user: { id: 1, name: 'Test User', email: 'test@example.com' } };
			mockApiService.get.mockResolvedValue(expectedResponse);

			const result = await authService.getUserDetails(token);

			expect(mockApiService.get).toHaveBeenCalledWith('/user', { headers: { Authorization: `Bearer ${token}` } });
			expect(result).toEqual(expectedResponse);
		});
	});
});