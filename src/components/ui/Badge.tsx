import React from 'react';

interface MetaTagProps {
  label: string;
  indicator?: 'default' | 'accent' | 'subtle';
  className?: string;
}

export const MetaTag: React.FC<MetaTagProps> = ({
  label,
  indicator = 'default',
  className = '',
}) => {
  const indicatorMap = {
    accent: 'text-[#B6FF4A] border-[#B6FF4A]/30 bg-[#B6FF4A]/5',
    subtle: 'text-[#A0AAA0] border-[#273128] bg-[#101510]',
    default: 'text-[#F4F7F1] border-[#273128] bg-[#141B15]',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono tracking-tight border rounded-xs uppercase select-none ${indicatorMap[indicator]} ${className}`}
    >
      <span
        className={`w-1 h-1 rounded-none rotate-45 shrink-0 ${
          indicator === 'accent' ? 'bg-[#B6FF4A]' : 'bg-[#A0AAA0]/50'
        }`}
      />
      <span>{label}</span>
    </span>
  );
};

interface InlineMetaProps {
  items: (string | React.ReactNode)[];
  separator?: string;
  className?: string;
}

export const InlineMeta: React.FC<InlineMetaProps> = ({
  items,
  separator = '·',
  className = '',
}) => {
  return (
    <div className={`flex flex-wrap items-center gap-2 text-xs text-[#A0AAA0] font-mono ${className}`}>
      {items.map((item, idx) => (
        <React.Fragment key={idx}>
          <span>{item}</span>
          {idx < items.length - 1 && (
            <span className="text-[#273128]" aria-hidden="true">
              {separator}
            </span>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};
