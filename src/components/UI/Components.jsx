import React from 'react';

export const Button = ({ children, onClick, type = 'button', variant = 'primary', className = '', ...props }) => {
    // New design system classes
    const baseStyle = "btn";

    const variants = {
        primary: "btn-primary",
        secondary: "btn-secondary",
        outline: "border-2 border-[var(--color-primary)] text-[var(--color-primary)] hover:bg-gray-50",
        danger: "btn-danger",
    };

    return (
        <button
            type={type}
            onClick={onClick}
            className={`${baseStyle} ${variants[variant]} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
};

export const Input = ({ label, type = 'text', id, value, onChange, placeholder, required = false }) => {
    return (
        <div className="flex flex-col gap-2 mb-4">
            {label && <label htmlFor={id} className="text-sm font-semibold text-[var(--color-text-main)]">{label}</label>}
            <input
                type={type}
                id={id}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                required={required}
                className="input-field"
            />
        </div>
    );
};

export const Card = ({ children, title, className = '' }) => {
    return (
        <div className={`card ${className}`}>
            {title && <h3 className="text-lg font-bold mb-4 pb-2 border-b border-[var(--color-border)]">{title}</h3>}
            {children}
        </div>
    );
};
