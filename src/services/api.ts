'use client';
import axios, { AxiosInstance } from 'axios';

export interface ApiService {
	post: (url: string, data: any) => Promise<any>;
	get: (url: string, config?: any) => Promise<any>;
}

export class AxiosApiService implements ApiService {
	private axios: AxiosInstance;

	constructor(baseURL: string) {
		this.axios = axios.create({ baseURL });
	}

	async post(url: string, data: any) {
		const response = await this.axios.post(url, data);
		return response.data;
	}

	async get(url: string, config?: any) {
		const response = await this.axios.get(url, config);
		return response.data;
	}
}