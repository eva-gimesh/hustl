import React, { HTMLAttributes } from 'react';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'interactive' | 'highlight' | 'flat';
  hasCutCorner?: boolean;
  accentBorder?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      children,
      variant = 'default',
      hasCutCorner = false,
      accentBorder = false,
      padding = 'md',
      className = '',
      ...props
    },
    ref
  ) => {
    const paddingStyles = {
      none: '',
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-8',
    };

    const variantStyles = {
      default: 'bg-[#141B15] border border-[#273128]',
      interactive:
        'bg-[#141B15] border border-[#273128] hover:border-[#B6FF4A]/50 hover:bg-[#182119] transition-all duration-200 cursor-pointer hover:shadow-[0_4px_24px_-4px_rgba(0,0,0,0.6)] group',
      highlight:
        'bg-[#141B15] border border-[#B6FF4A]/40 shadow-[0_0_24px_-6px_rgba(182,255,74,0.12)]',
      flat: 'bg-[#101510] border border-[#273128]/70',
    };

    const cutCornerStyle = hasCutCorner ? 'cut-corner-br' : 'rounded-sm';
    const accentTopBorder = accentBorder ? 'border-t-2 border-t-[#B6FF4A]' : '';

    return (
      <div
        ref={ref}
        className={`relative ${cutCornerStyle} ${variantStyles[variant]} ${accentTopBorder} ${paddingStyles[padding]} ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';
