'use client';
import {describe, expect, test, it, jest, beforeEach} from '@jest/globals';
import userReducer, {
		UserState,
		loginUser,
		fetchUserDetails,
		logout,
		UserAPI
	} from '@/store/userSlice';
import { configureStore } from '@reduxjs/toolkit';
import { kStringMaxLength } from 'buffer';
	
	describe('User Slice', () => {
		let initialState: jest.Mocked<UserState>;
		let mockUserAPI: jest.Mocked<UserAPI>;
	
		beforeEach(() => {
			initialState = {
				token: null,
				user: null,
				status: 'idle',
				error: null,
			};

			mockUserAPI = {
				login: jest.fn(),
				fetchUserDetails: jest.fn(),
			};
		});
	
		const createStore = (api: UserAPI) =>
			configureStore({
				reducer: { user: userReducer },
				middleware: (getDefaultMiddleware) =>
					getDefaultMiddleware({
						thunk: {
							extraArgument: api,
						},
					}),
			});
	
		describe('loginUser', () => {
			it('should update state correctly when login is successful', async () => {
				const store = createStore(mockUserAPI);
				const token = 'fake-token';
				mockUserAPI.login.mockResolvedValue(token);
	
				await store.dispatch(loginUser({ email: 'test@example.com', password: 'password' }));
	
				const state = store.getState().user;
				expect(state.token).toBe(token);
				expect(state.status).toBe('succeeded');
				expect(state.error).toBeNull();
			});
	
			it('should update state correctly when login fails', async () => {
				const store = createStore(mockUserAPI);
				const errorMessage = 'Invalid credentials';
				mockUserAPI.login.mockRejectedValue(new Error(errorMessage));
	
				await store.dispatch(loginUser({ email: 'test@example.com', password: 'password' }));
	
				const state = store.getState().user;
				expect(state.token).toBeNull();
				expect(state.status).toBe('failed');
				expect(state.error).toBe(errorMessage);
			});
		});
	
		describe('fetchUserDetails', () => {
			it('should update state correctly when fetching user details is successful', async () => {
				const store = createStore(mockUserAPI);
				const userDetails = { id: 1, name: 'Test User', email: 'test@example.com' };
				mockUserAPI.fetchUserDetails.mockResolvedValue(userDetails);
	
				// store.dispatch({ type: 'user/loginUser/fulfilled', payload: 'fake-token' });
				await store.dispatch(fetchUserDetails());
	
				const state = store.getState().user;
				expect(state.user).toEqual(userDetails);
				expect(state.status).toBe('succeeded');
				expect(state.error).toBeNull();
			});
	
			it('should update state correctly when fetching user details fails', async () => {
                const store = createStore(mockUserAPI);
				const errorMessage = 'Failed to fetch user details';
				mockUserAPI.fetchUserDetails.mockRejectedValue(new Error(errorMessage));
	
				store.dispatch({ type: 'user/loginUser/fulfilled', payload: 'fake-token' });
				await store.dispatch(fetchUserDetails());
	
				const state = store.getState().user;
				expect(state.user).toBeNull();
				expect(state.status).toBe('failed');
				expect(state.error).toBe(errorMessage);
			});
		});
	
		describe('logout', () => {
			it('should reset the state to initial values', () => {
				const store = createStore(mockUserAPI);
				store.dispatch({ type: 'user/loginUser/fulfilled', payload: 'fake-token' });
				store.dispatch({ type: 'user/fetchUserDetails/fulfilled', payload: { id: 1, name: 'Test User', email: 'test@example.com' } });
	
				store.dispatch(logout());
	
				const state = store.getState().user;
				expect(state).toEqual(initialState);
			});
		});
	});