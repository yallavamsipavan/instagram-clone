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



export default function RegisterPage() {
    const router = useRouter();
    const setAuth = useAuthStore((state) => state.setAuth);
    const setUser = useAuthStore((state) => state.setUser);

    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        fullName: ''
    });
    const [error, setError] = useState('');
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setFieldErrors({});
        setIsLoading(true);

        try {
            const response = await authApi.register(formData);

            localStorage.setItem('accessToken', response.accessToken);
            localStorage.setItem('refreshToken', response.refreshToken);
            localStorage.setItem('username', response.username);

            setAuth(response.username);

            const profile = await userApi.getProfile(response.username);
            setUser(profile);

            router.push('/feed');
        } catch (err) {
            const axiosError = err as AxiosError<ApiErrorResponse>;
            const data = axiosError.response?.data;

            if(data?.details) {
                // Validation errors come as "field: message" strings
                const errors: Record<string, string> = {};
                data.details.forEach((details) => {
                    const [field, message] = details.split(' : ');
                    errors[field.trim()] = message?.trim() || 'Invalid value';
                });
                setFieldErrors(errors);
            } else setError(data?.message || 'Registration failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950 px-4 py-8 relative overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl" />

        <div className="w-full max-w-sm relative z-10 animate-fade-in-up">
            <div className="bg-zinc-900/80 backdrop-blur-xl border border-zinc-800 rounded-2xl p-8 shadow-2xl">
            <h1 className="text-4xl font-bold text-center mb-1 bg-gradient-to-r from-purple-400 via-pink-400 to-orange-300 bg-clip-text text-transparent">
                Instagram
            </h1>
            <p className="text-center text-zinc-500 text-sm mb-6">
                Sign up to see photos and videos from your friends.
            </p>

            <form onSubmit={handleSubmit} className="space-y-3">
                <Input
                type="text"
                name="fullName"
                placeholder="Full Name"
                value={formData.fullName}
                onChange={handleChange}
                />
                <Input
                type="text"
                name="username"
                placeholder="Username"
                value={formData.username}
                onChange={handleChange}
                error={fieldErrors.username}
                required
                />
                <Input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                error={fieldErrors.email}
                required
                />
                <Input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                error={fieldErrors.password}
                required
                />

                {error && (
                <p className="text-sm text-red-400 text-center bg-red-500/10 border border-red-500/20 rounded-lg py-2 px-3">
                    {error}
                </p>
                )}

                <Button type="submit" fullWidth isLoading={isLoading} className="mt-2">
                Sign Up
                </Button>
            </form>
            </div>

            <div className="bg-zinc-900/80 backdrop-blur-xl border border-zinc-800 rounded-2xl p-6 mt-3 text-center shadow-xl">
            <p className="text-sm text-zinc-400">
                Already have an account?{' '}
                <Link href="/login" className="text-pink-400 font-semibold hover:text-pink-300 transition-colors">
                Log in
                </Link>
            </p>
            </div>
        </div>
      </div>
    );
}