import React from 'react';

interface SectionHeaderProps {
  kicker?: string;
  title: string;
  subtitle?: string;
  align?: 'left' | 'center';
  className?: string;
  size?: 'md' | 'lg' | 'xl';
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  kicker,
  title,
  subtitle,
  align = 'left',
  className = '',
  size = 'lg',
}) => {
  const alignClass = align === 'center' ? 'text-center mx-auto items-center' : 'text-left items-start';

  const titleSizeMap = {
    md: 'text-2xl md:text-3xl',
    lg: 'text-3xl md:text-4xl lg:text-5xl',
    xl: 'text-4xl md:text-5xl lg:text-6xl',
  };

  return (
    <div className={`flex flex-col ${alignClass} max-w-3xl ${className}`}>
      {kicker && (
        <div className="flex items-center gap-2 mb-3">
          <span className="w-1.5 h-1.5 bg-[#B6FF4A] rotate-45" />
          <span className="text-xs font-mono uppercase tracking-widest text-[#B6FF4A]">
            {kicker}
          </span>
        </div>
      )}
      <h2
        className={`font-display font-extrabold tracking-tight text-[#F4F7F1] leading-[1.08] [text-wrap:balance] ${titleSizeMap[size]}`}
      >
        {title}
      </h2>
      {subtitle && (
        <p className="mt-3.5 text-base md:text-lg text-[#A0AAA0] leading-relaxed [text-wrap:pretty]">
          {subtitle}
        </p>
      )}
    </div>
  );
};

export const GeometricDivider: React.FC<{ className?: string; accent?: boolean }> = ({
  className = '',
  accent = false,
}) => {
  return (
    <div className={`relative w-full flex items-center justify-center my-8 ${className}`}>
      <div className="w-full border-t border-[#273128]" />
      <div className="absolute flex items-center gap-1.5 bg-[#080B09] px-3">
        <span className={`w-1 h-1 rotate-45 ${accent ? 'bg-[#B6FF4A]' : 'bg-[#273128]'}`} />
        <span className="w-1.5 h-1.5 rotate-45 bg-[#273128]" />
        <span className={`w-1 h-1 rotate-45 ${accent ? 'bg-[#B6FF4A]' : 'bg-[#273128]'}`} />
      </div>
    </div>
  );
};
