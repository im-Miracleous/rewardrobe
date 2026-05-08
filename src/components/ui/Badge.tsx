import React from 'react';

interface BadgeProps {
    children: React.ReactNode;
    color?: 'green' | 'yellow' | 'blue' | 'stone';
}

export const Badge: React.FC<BadgeProps> = ({ children, color = 'green' }) => {
    const colors = {
        green: "bg-green-100 text-green-700",
        yellow: "bg-yellow-100 text-yellow-700",
        blue: "bg-blue-100 text-blue-700",
        stone: "bg-stone-100 text-stone-600",
    };

    return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold font-display ${colors[color]}`}>
            {children}
        </span>
    );
};