import api from './axios';
import { FollowResponse, PageResponse } from '@/types';

export const followApi = {
    sendRequest: async (targetUserId: number): Promise<FollowResponse> => {
        const response = await api.post<FollowResponse>(`/follows/${targetUserId}`);
        return response.data;
    },

    accept: async (followerUserId: number): Promise<FollowResponse> => {
        const response = await api.put<FollowResponse>(`/follows/${followerUserId}/accept`);
        return response.data;
    },

    reject: async (followerUserId: number): Promise<void> => {
        await api.delete(`/follows/${followerUserId}/reject`);
    },

    unfollow: async (targetUserId: number): Promise<void> => {
        await api.delete(`/follows/${targetUserId}`);
    },

    getFollowers: async (userId: number, page = 0, size = 20): Promise<PageResponse<FollowResponse>> => {
        const response = await api.get<PageResponse<FollowResponse>>(`/follows/${userId}/followers`, {
            params: { page, size }
        });
        return response.data;
    },

    getFollowing: async (userId: number, page = 0, size = 20): Promise<PageResponse<FollowResponse>> => {
        const response = await api.get<PageResponse<FollowResponse>>(`/follows/${userId}/following`, {
            params: { page, size }
        });
        return response.data;
    },

    getStatus: async (targetUserId: number): Promise<FollowResponse> => {
        const response = await api.get<FollowResponse>(`/follows/status/${targetUserId}`);
        return response.data;
    }
};