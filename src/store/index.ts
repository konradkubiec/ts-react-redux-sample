'use client';
import { configureStore } from '@reduxjs/toolkit';
import { AxiosApiService } from '../services/api';
import { ApiAuthService } from '../services/auth';
import  { createUserSlice }  from './userSlice';

const apiService = new AxiosApiService('http://localhost:3000/api');
const authService = new ApiAuthService(apiService);
const { userSlice, registerUser, loginUser, fetchUserDetails } = createUserSlice(authService);

export const store = configureStore({
	reducer: {
		user: userSlice.reducer,
	},
});

export { registerUser, loginUser, fetchUserDetails };
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;