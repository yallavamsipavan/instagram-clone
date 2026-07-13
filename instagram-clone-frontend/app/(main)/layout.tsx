"use client";

import Sidebar from "@/components/layout/Sidebar";
import { useAuthStore } from "@/lib/store/authStore";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";

export default function MainLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const { isAuthenticated, isLoading } = useAuthStore();

    useEffect(() => {
        if (!isLoading && !isAuthenticated) router.push('/login');
    }, [isAuthenticated, isLoading, router]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-zinc-950">
                <div className="w-8 h-8 border-2 border-zinc-700 border-t-pink-400 rounded-full animate-spin" />
            </div>
        );
    }

    if (!isAuthenticated) return null; // brief flash before redirect effect kicks in

    return (
        <div className="min-h-screen bg-zinc-950 flex">
            <Sidebar />
            <main className="flex-1 md:ml-64 pb-16 md:pb-0">{children}</main>
        </div>
    )
}