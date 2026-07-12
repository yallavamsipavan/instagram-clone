import api from './axios';
import { Post, PageResponse } from '@/types';

export const postsApi = {
    createPost: async (file: File, caption: string): Promise<Post> => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('caption', caption);

        const response = await api.post<Post>('/posts', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    },

    deletePost: async (postId: number): Promise<void> => {
        await api.delete(`/posts/${postId}`);
    },

    getUserPosts: async (username: string, page = 0, size = 20): Promise<PageResponse<Post>> => {
        const response = await api.get<PageResponse<Post>>(`/posts/user/${username}`, {
            params: { page, size },
        });
        return response.data;
    },

    getFeed: async (page = 0, size = 20): Promise<PageResponse<Post>> => {
        const response = await api.get<PageResponse<Post>>('/posts/feed', {
            params: { page, size },
        });
        return response.data;
    }
};