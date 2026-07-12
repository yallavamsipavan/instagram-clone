import api from "./axios";
import { Notification, PageResponse } from "@/types";

export const notificationsApi = {
    getNotifications: async (page = 0, size = 20): Promise<PageResponse<Notification>> => {
        const response = await api.get<PageResponse<Notification>>('/notifications', {
            params: { page, size }
        });
        return response.data;
    },

    markAsRead: async (notificationId: number): Promise<void> => {
        await api.patch(`/notifications/${notificationId}/read`);
    },

    getUnreadCount: async (): Promise<number> => {
        const response = await api.get<number>('/notifications/unread-count');
        return response.data;
    }
};