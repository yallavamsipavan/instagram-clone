import api from "./axios";
import { Comment, CommentRequest, PageResponse } from "@/types";

export const commentsApi = {
    addComment: async (postId: number, data: CommentRequest): Promise<Comment> => {
        const response = await api.post<Comment>(`/posts/${postId}/comments`, data);
        return response.data;
    },

    deleteComment: async (commentId: number): Promise<void> => {
        await api.delete(`/comments/${commentId}`);
    },

    getComments: async (postId: number, page = 0, size = 20): Promise<PageResponse<Comment>> => {
        const response = await api.get<PageResponse<Comment>>(`/posts/${postId}/comments`, {
            params: { page, size }
        });
        return response.data;
    },

    getReplies: async (commentId: number, page = 0, size = 20): Promise<PageResponse<Comment>> => {
        const response = await api.get<PageResponse<Comment>>(`/comments/${commentId}/replies`, {
            params: { page, size }
        });
        return response.data;
    }
};