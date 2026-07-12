import api from './axios';

export const likesApi = {
    likePost: async (postId: number): Promise<void> => {
        await api.post(`/posts/${postId}/like`);
    },

    unlikePost: async (postId: number): Promise<void> => {
        await api.delete(`/posts/${postId}/like`);
    },

    likeComment: async (commentId: number): Promise<void> => {
        await api.post(`/comments/${commentId}/like`);
    },

    unlikeComment: async (commentId: number): Promise<void> => {
        await api.delete(`/comments/${commentId}/like`);
    }
};