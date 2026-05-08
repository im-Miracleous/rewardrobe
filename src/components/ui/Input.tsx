import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

export const Input: React.FC<InputProps> = ({ label, id, error, className = '', ...props }) => (
    <div className="flex flex-col gap-1.5 w-full">
        {label && <label htmlFor={id} className="text-sm font-bold text-stone-700 font-display">{label}</label>}
        <input
            id={id}
            className={`w-full rounded-xl border ${error ? 'border-red-500' : 'border-stone-200'} px-4 py-3 text-sm text-stone-800 bg-white transition-all focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 ${className}`}
            {...props}
        />
        {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
);