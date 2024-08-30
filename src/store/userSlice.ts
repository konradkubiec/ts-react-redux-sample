'use client';
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

interface User {
	id: number;
	name: string;
	email: string;
};

// Define the shape of our user state
export interface UserState {
	token: string | null;
	user: User | null;
	status: 'idle' | 'loading' | 'succeeded' | 'failed';
	error: string | null;
}

// Initial state
const initialState: UserState = {
	token: null,
	user: null,
	status: 'idle',
	error: null,
};

// Define our API interface for dependency injection
export interface UserAPI {
	login: (email: string, password: string) => Promise<string>;
	fetchUserDetails: (token: string) => Promise<{ id: number; name: string; email: string }>;
}

// Create our async thunks with dependency injection
export const loginUser = createAsyncThunk<
	string,
	{ email: string; password: string },
	{ extra: UserAPI }
>('user/login', async ({ email, password }, { extra }) => {
	return await extra.login(email, password);
});

export const fetchUserDetails = createAsyncThunk<
	{ id: number; name: string; email: string },
	void,
	{ extra: UserAPI; state: { user: UserState } }
>('user/fetchDetails', async (_, { getState, extra }) => {
	const { user } = getState();
	if (!user.token) throw new Error('No token available');
	return await extra.fetchUserDetails(user.token);
});

// Create our slice
const userSlice = createSlice({
	name: 'user',
	initialState,
	reducers: {
		logout: (state) => {
			state.token = null;
			state.user = null;
			state.status = 'idle';
			state.error = null;
		},
	},
	extraReducers: (builder) => {
		builder
			.addCase(loginUser.pending, (state) => {
				state.status = 'loading';
				state.error = null;
			})
			.addCase(loginUser.fulfilled, (state, action: PayloadAction<string>) => {
				state.status = 'succeeded';
				state.token = action.payload;
				state.error = null;
			})
			.addCase(loginUser.rejected, (state, action) => {
				state.status = 'failed';
				state.error = action.error.message || 'Login failed';
			})
			.addCase(fetchUserDetails.pending, (state) => {
				state.status = 'loading';
			})
			.addCase(fetchUserDetails.fulfilled, (state, action: PayloadAction<User>) => {
				state.status = 'succeeded';
				state.user = action.payload;
				state.error = null;
			})
			.addCase(fetchUserDetails.rejected, (state, action) => {
				state.status = 'failed';
				state.error = action.error.message || 'Failed to fetch user details';
			});
	},
});

export const { logout } = userSlice.actions;

export default userSlice.reducer;