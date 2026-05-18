import axios, { AxiosResponse } from 'axios';
import getBaseUrl from '../../config';

// 1. Initialize your base API configuration
const { apiAccessPoint } = getBaseUrl();

const apiInstance = axios.create({
    baseURL: apiAccessPoint,
    timeout: 20000, // Safe boundary for mobile network drops (20s)
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

export const POST = async <T = any>(endpoint: string, data?: unknown): Promise<T> => {
    const response: AxiosResponse<T> = await apiInstance.post(endpoint, data);
    return response.data;
};

export const GET = async <T = any>(endpoint: string, params?: unknown): Promise<T> => {
    const response: AxiosResponse<T> = await apiInstance.get(endpoint, { params });
    return response.data;
};