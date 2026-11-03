import React from 'react';
import { Link } from 'react-router-dom';

interface HustlLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  withLink?: boolean;
  className?: string;
  showMarkOnly?: boolean;
}

export const HustlLogo: React.FC<HustlLogoProps> = ({
  size = 'md',
  withLink = true,
  className = '',
  showMarkOnly = false,
}) => {
  const sizeMap = {
    sm: { icon: 'w-6 h-6', text: 'text-lg', badge: 'text-[9px]' },
    md: { icon: 'w-8 h-8', text: 'text-2xl', badge: 'text-[10px]' },
    lg: { icon: 'w-10 h-10', text: 'text-3xl', badge: 'text-[11px]' },
    xl: { icon: 'w-14 h-14', text: 'text-5xl', badge: 'text-xs' },
  };

  const dimensions = sizeMap[size];

  const content = (
    <div className={`inline-flex items-center gap-2.5 group select-none ${className}`}>
      {/* Precision Geometric Monogram */}
      <div className={`relative flex items-center justify-center shrink-0 ${dimensions.icon}`}>
        <svg
          viewBox="0 0 36 36"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full transform transition-transform duration-300 group-hover:scale-105"
        >
          {/* Outer sharp polygonal frame */}
          <path
            d="M4 4H32L28 32H8L4 4Z"
            fill="#101510"
            stroke="#273128"
            strokeWidth="1.5"
          />
          {/* Left upright angled stroke */}
          <path
            d="M9 9H14L13 27H8L9 9Z"
            fill="#F4F7F1"
            className="transition-colors duration-200 group-hover:fill-white"
          />
          {/* Right upright angled stroke */}
          <path
            d="M22 9H27L26 27H21L22 9Z"
            fill="#F4F7F1"
            className="transition-colors duration-200 group-hover:fill-white"
          />
          {/* Dynamic precision crossbar with electric green accent */}
          <polygon
            points="11,16 25,14 24,19 10,21"
            fill="#B6FF4A"
            className="transition-all duration-300 group-hover:brightness-110"
          />
          {/* Corner highlight dot */}
          <circle cx="28" cy="8" r="1.5" fill="#B6FF4A" />
        </svg>
      </div>

      {!showMarkOnly && (
        <div className="flex items-baseline tracking-tight">
          <span className={`font-display font-extrabold uppercase tracking-tighter text-[#F4F7F1] ${dimensions.text}`}>
            HUSTL
          </span>
          <span className="text-[#B6FF4A] font-extrabold ml-0.5">.</span>
        </div>
      )}
    </div>
  );

  if (withLink) {
    return (
      <Link
        to="/"
        className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B6FF4A] focus-visible:ring-offset-2 focus-visible:ring-offset-[#080B09] rounded-sm transition-opacity hover:opacity-95"
        aria-label="HUSTL Home"
      >
        {content}
      </Link>
    );
  }

  return content;
};
