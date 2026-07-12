"use client";

import { InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(({ error, className = '', ...props }, ref) => {
    return (
        <div className="w-full">
            <input
                ref={ref}
                className={`w-full px-4 py-2.5 text-sm rounded-lg
                    bg-zinc-800/60 text-zinc-100 placeholder:text-zinc-500
                    border ${error ? 'border-red-500/60' : 'border-zinc-700'}
                    focus:outline-none focus:border-transparent focus:ring-2 focus:ring-pink-500/50
                    transition-all duration-200
                    ${className}`}
                { ...props }
            />
            { error && <p className="mt-1.5 text-xs text-red-400">{ error }</p>}
        </div>
    );
});

Input.displayName = 'Input';
export default Input;