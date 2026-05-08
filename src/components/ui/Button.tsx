import React from "react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "outline" | "white" | "ghost" | "danger";
    size?: "sm" | "md" | "lg";
}

export const Button: React.FC<ButtonProps> = ({
    children,
    variant = "primary",
    size = "md",
    className = "",
    ...props
}) => {
    const baseStyle =
        "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all duration-200";

    const sizes = {
        sm: "px-4 py-2 text-sm",
        md: "px-6 py-3 text-sm",
        lg: "px-8 py-4 text-base",
    };

    const variants = {
        primary:
            "bg-green-600 text-white hover:bg-green-700 hover:shadow-lg hover:shadow-green-600/20 hover:-translate-y-0.5",
        outline:
            "bg-transparent text-green-700 border-2 border-green-300 hover:bg-green-50 hover:border-green-500",
        white:
            "bg-white text-green-800 hover:bg-stone-50 hover:shadow-xl hover:-translate-y-0.5",
        ghost:
            "bg-transparent text-stone-600 hover:bg-stone-100 hover:text-stone-900",
        danger: "bg-red-500 text-white hover:bg-red-600",
    };

    return (
        <button
            className={`${baseStyle} ${sizes[size]} ${variants[variant]} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
};
