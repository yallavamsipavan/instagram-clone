import api from "./axios";
import { Message, SendMessageRequest, ConversationPreview, PageResponse } from "@/types";

export const messagesApi = {
    sendMessage: async (receiverId: number, data: SendMessageRequest): Promise<Message> => {
        const response = await api.post<Message>(`/messages/${receiverId}`, data);
        return response.data;
    },

    editMessage: async (messageId: number, content: string): Promise<Message> => {
        const response = await api.put<Message>(`/messages/${messageId}`, { content });
        return response.data;
    },

    unsendMessage: async (messageId: number): Promise<void> => {
        await api.delete(`/messages/${messageId}`);
    },

    getConversation: async (otherUserId: number, page = 0, size = 30): Promise<PageResponse<Message>> => {
        const response = await api.get<PageResponse<Message>>(`/messages/conversation/${otherUserId}`, {
            params: { page, size }
        });
        return response.data;
    },

    getConversationsList: async (): Promise<ConversationPreview[]> => {
        const response = await api.get<ConversationPreview[]>(`/messages/conversations`);
        return response.data;
    }
};