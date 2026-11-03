import React, { ButtonHTMLAttributes } from 'react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'accent-outline';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      className = '',
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-display font-semibold transition-all duration-200 select-none cursor-pointer whitespace-nowrap shrink-0 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B6FF4A] focus-visible:ring-offset-2 focus-visible:ring-offset-[#080B09]';

    const sizeStyles = {
      sm: 'text-xs px-3.5 py-1.5 gap-1.5 tracking-tight',
      md: 'text-sm px-5 py-2.5 gap-2 tracking-tight',
      lg: 'text-base px-7 py-3.5 gap-2.5 tracking-normal',
    };

    const variantStyles = {
      // Primary: High-contrast electric green with dark text
      primary:
        'bg-[#B6FF4A] text-[#080B09] hover:bg-[#c4ff68] active:translate-y-[1px] hover:shadow-[0_0_20px_-3px_rgba(182,255,74,0.35)] font-bold rounded-sm border border-[#B6FF4A]',
      // Secondary: Deep card surface with precision border and subtle green hover border
      secondary:
        'bg-[#141B15] text-[#F4F7F1] border border-[#273128] hover:border-[#B6FF4A]/60 hover:text-white hover:bg-[#1a231b] active:translate-y-[1px] rounded-sm',
      // Outline: Sleek dark hairline with green highlight
      outline:
        'bg-transparent text-[#F4F7F1] border border-[#273128] hover:border-[#7CCB37] hover:bg-[#101510] active:translate-y-[1px] rounded-sm',
      // Ghost: Minimalist text link with subtle surface hover
      ghost:
        'bg-transparent text-[#A0AAA0] hover:text-[#F4F7F1] hover:bg-[#141B15] active:translate-y-[1px] rounded-sm',
      // Accent Outline: Sharp green border with transparent fill
      'accent-outline':
        'bg-transparent text-[#B6FF4A] border border-[#B6FF4A] hover:bg-[#B6FF4A]/10 active:translate-y-[1px] rounded-sm',
    };

    const widthStyle = fullWidth ? 'w-full' : '';

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${widthStyle} ${className}`}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin shrink-0" />
        ) : (
          leftIcon && <span className="shrink-0">{leftIcon}</span>
        )}
        <span>{children}</span>
        {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';
