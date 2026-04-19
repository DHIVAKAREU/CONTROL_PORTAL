import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = ({ 
  className, 
  variant = 'primary', 
  size = 'md', 
  ...props 
}: ButtonProps) => {
  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95',
    secondary: 'bg-gray-800 text-gray-100 hover:bg-gray-700 active:scale-95',
    outline: 'border border-gray-700 bg-transparent text-gray-300 hover:border-gray-600 hover:text-white',
    ghost: 'bg-transparent text-gray-400 hover:text-white hover:bg-gray-800',
    danger: 'bg-red-600 text-white hover:bg-red-700 active:scale-95',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-md font-medium transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:pointer-events-none',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  );
};

export const Card = ({ className, children }: { className?: string, children: React.ReactNode }) => (
  <div className={cn('bg-[#0d1018] border border-white/5 rounded-xl overflow-hidden', className)}>
    {children}
  </div>
);

export const CardHeader = ({ className, title, action }: { className?: string, title: string, action?: React.ReactNode }) => (
  <div className={cn('px-5 py-4 border-b border-white/5 flex items-center justify-between', className)}>
    <h3 className="text-xs font-bold uppercase tracking-wider text-gray-300 font-mono">{title}</h3>
    {action}
  </div>
);

export const CardBody = ({ className, children }: { className?: string, children: React.ReactNode }) => (
  <div className={cn('p-5', className)}>
    {children}
  </div>
);
