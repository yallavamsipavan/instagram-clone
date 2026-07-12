"use client";

import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { authApi } from "@/lib/api/auth";
import { userApi } from "@/lib/api/user";
import { useAuthStore } from "@/lib/store/authStore";
import { ApiErrorResponse } from "@/types";
import { AxiosError } from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

export default function LoginPage() {
    const router = useRouter();
    const setAuth = useAuthStore((state) => state.setAuth);
    const setUser = useAuthStore((state) => state.setUser);

    const [usernameOrEmail, setUsernameOrEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const response = await authApi.login({ usernameOrEmail, password });

            localStorage.setItem('accessToken', response.accessToken);
            localStorage.setItem('refreshToken', response.refreshToken);
            localStorage.setItem('username', response.username);

            setAuth(response.username);

            const profile = await userApi.getProfile(response.username);
            setUser(profile);

            router.push('/feed');
        } catch (err) {
            const axiosError = err as AxiosError<ApiErrorResponse>;
            setError(axiosError.response?.data?.message || 'Login failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950 px-4 relative overflow-hidden">
        {/* Ambient background glow */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl" />

        <div className="w-full max-w-sm relative z-10 animate-fade-in-up">
            <div className="bg-zinc-900/80 backdrop-blur-xl border border-zinc-800 rounded-2xl p-8 shadow-2xl">
            <h1 className="text-4xl font-bold text-center mb-1 bg-gradient-to-r from-purple-400 via-pink-400 to-orange-300 bg-clip-text text-transparent">
                Instagram
            </h1>
            <p className="text-center text-zinc-500 text-sm mb-8">
                Welcome back
            </p>

            <form onSubmit={handleSubmit} className="space-y-3">
                <Input
                type="text"
                placeholder="Username or email"
                value={usernameOrEmail}
                onChange={(e) => setUsernameOrEmail(e.target.value)}
                required
                />
                <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                />

                {error && (
                <p className="text-sm text-red-400 text-center bg-red-500/10 border border-red-500/20 rounded-lg py-2 px-3">
                    {error}
                </p>
                )}

                <Button type="submit" fullWidth isLoading={isLoading} className="mt-2">
                Log In
                </Button>
            </form>
            </div>

            <div className="bg-zinc-900/80 backdrop-blur-xl border border-zinc-800 rounded-2xl p-6 mt-3 text-center shadow-xl">
            <p className="text-sm text-zinc-400">
                Don&apos;t have an account?{' '}
                <Link href="/register" className="text-pink-400 font-semibold hover:text-pink-300 transition-colors">
                Sign up
                </Link>
            </p>
            </div>
        </div>
      </div>
    );
}