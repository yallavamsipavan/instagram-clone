import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { AuthResponse } from "@/types";

const api = axios.create({
    baseURL: 'http://localhost:8080/api',
});

// Attach access token to every outgoing request
api.interceptors.request.use((config) => {
    if(typeof window !== 'undefined') {
        const token = localStorage.getItem('accessToken');
        if(token) config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// track ongoing refresh so multiple simultaneous 401s don't trigger mltiple refresh calls
let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

function subscribeTokenRefresh(callback: (token: string) => void) {
    refreshSubscribers.push(callback);
}

function onRefreshed(token: string) {
    refreshSubscribers.forEach((callback) => callback(token));
    refreshSubscribers = [];
}

// On 401, try to refresh the access token once, then retry the original request
api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        if(error.response?.status === 401 && !originalRequest._retry) {
            const refreshToken = localStorage.getItem('refreshToken');

            // No fresh token available, or this IS the refresh call failing - force logout
            if(!refreshToken || originalRequest.url?.includes('/auth/refresh')) {
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                window.location.href = '/login';
                return Promise.reject(error);
            }

            if(isRefreshing) {
                //  Wait for the in-flight refresh to finish, then retry with the new token
                return new Promise((resolve) => {
                    subscribeTokenRefresh((newToken: string) => {
                        originalRequest.headers.Authorization = `Bearer ${newToken}`;
                        resolve(api(originalRequest));
                    });
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const response = await axios.post<AuthResponse>(
                    'http://localhost:8080/api/auth/refresh',
                    { refreshToken }
                );

                const { accessToken, refreshToken: newRefreshToken } = response.data;
                localStorage.setItem('accessToken', accessToken);
                localStorage.setItem('refreshToken', newRefreshToken);

                isRefreshing = false;
                onRefreshed(accessToken);

                originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                return api(originalRequest);
            } catch (refreshError) {
                isRefreshing = false;
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    }
);

export default api;