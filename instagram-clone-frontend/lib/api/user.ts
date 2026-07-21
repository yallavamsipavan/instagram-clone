import api from './axios';
import { UserProfile, UpdateProfileRequest } from '@/types';

export const userApi = {
    getProfile: async (username: string): Promise<UserProfile> => {
        const response = await api.get<UserProfile>(`/users/${username}`);
        return response.data;
    },

    updateProfile: async (data: UpdateProfileRequest): Promise<UserProfile> => {
        const response = await api.put<UserProfile>('/users/me', data);
        return response.data;
    },

    togglePrivacy: async (): Promise<UserProfile> => {
        const response = await api.patch<UserProfile>('/users/me/privacy');
        return response.data;
    },

    search: async (query: string): Promise<UserProfile[]> => {
        const response = await api.get<UserProfile[]>('/users/search', { params: { query } });
        return response.data;
    },

    uploadAvatar: async (file: File): Promise<UserProfile> => {
        const formData = new FormData();
        formData.append('file', file);
        const response = await api.post<UserProfile>('/users/me/avatar', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    }
};