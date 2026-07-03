import React from 'react';

interface ButtonProps {
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
  variant?: 'primary' | 'secondary' | 'ghost' | 'accent';
}

const Button: React.FC<ButtonProps> = ({ onClick, children, className = '', variant = 'primary' }) => {
  const baseStyles = 'inline-flex items-center justify-center gap-2 h-12 px-6 rounded-full transition';
  const variantStyles = {
    primary: 'bg-accent text-white border-accent',
    secondary: 'bg-canvas text-fg border-line',
    ghost: 'bg-transparent text-fg border-transparent',
    accent: 'bg-accent text-white border-accent',
  };

  return (
    <button
      onClick={onClick}
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

export default Button;