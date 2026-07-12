"use client";

import React, { useEffect } from "react";
import { useAuthStore } from "@/lib/store/authStore";

export default function AuthInitializer({ children }: { children: React.ReactNode }) {
    const initializeAuth = useAuthStore((state) => state.initializeAuth);

    useEffect(() => {
        initializeAuth();
    }, [initializeAuth]);

    return <>{ children }</>;
}