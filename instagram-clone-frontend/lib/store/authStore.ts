import { create } from "zustand";
import { UserProfile } from "@/types";

interface AuthState {
    user: UserProfile | null;
    username: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    setAuth: (username: string) => void;
    setUser: (user: UserProfile) => void;
    logout: () => void;
    initializeAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    username: null,
    isAuthenticated: false,
    isLoading: true,

    setAuth: (username: string) => {
        set({ username, isAuthenticated: true });
    },

    setUser: (user: UserProfile) => {
        set({ user });
    },

    logout: () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('username');
        set({
            user: null,
            username: null,
            isAuthenticated: false
        });
        window.location.href = '/login';
    },

    initializeAuth: () => {
        if(typeof window !== 'undefined') {
            const token = localStorage.getItem('accessToken');
            const username = localStorage.getItem('username');
            if(token && username) set({
                username,
                isAuthenticated: true,
                isLoading: false
            });
            else set({ isLoading: false });
        }
    }
}));