"use client";

import { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
    isLoading?: boolean;
    fullWidth?: boolean;
}

export default function Button({
    variant = 'primary',
    isLoading = false,
    fullWidth = false,
    children,
    className = '',
    disabled,
    ...props
}: ButtonProps) {
    
    const baseStyles = 'font-semibold rounded-lg transition-all duration-200 px-4 py-2.5 text-sm disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]';

    const variants = {
        primary: 'bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 text-white hover:brightness-110 shadow-lg shadow-pink-500/20',
        secondary: 'bg-zinc-800 text-zinc-100 hover:bg-zinc-700 border border-zinc-700',
        danger: 'bg-red-500/90 text-white hover:bg-red-500',
        ghost: 'bg-transparent text-pink-400 hover:bg-pink-500/10'
    };

    return (
        <button
            className={`${baseStyles} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
            disabled={disabled || isLoading}
            {...props}
            >
            {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Loading...
                </span>
            ) : (
                children
            )}
        </button>
    );
}