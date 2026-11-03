import React, { InputHTMLAttributes, TextareaHTMLAttributes } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, leftIcon, rightIcon, className = '', id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-mono uppercase tracking-wider text-[#A0AAA0]"
          >
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3.5 text-[#A0AAA0] pointer-events-none flex items-center">
              {leftIcon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            className={`w-full bg-[#101510] text-[#F4F7F1] placeholder-[#A0AAA0]/40 text-sm border ${
              error ? 'border-red-500/80 focus:border-red-500' : 'border-[#273128] focus:border-[#B6FF4A]'
            } rounded-sm py-2.5 ${leftIcon ? 'pl-10' : 'pl-3.5'} ${
              rightIcon ? 'pr-10' : 'pr-3.5'
            } focus:outline-none transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3.5 text-[#A0AAA0] flex items-center">
              {rightIcon}
            </div>
          )}
        </div>
        {error ? (
          <p className="text-xs text-red-400 font-mono">{error}</p>
        ) : helperText ? (
          <p className="text-xs text-[#A0AAA0]/70 font-mono">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, helperText, className = '', id, rows = 4, ...props }, ref) => {
    const textareaId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={textareaId}
            className="block text-xs font-mono uppercase tracking-wider text-[#A0AAA0]"
          >
            {label}
          </label>
        )}
        <textarea
          id={textareaId}
          ref={ref}
          rows={rows}
          className={`w-full bg-[#101510] text-[#F4F7F1] placeholder-[#A0AAA0]/40 text-sm border ${
            error ? 'border-red-500/80 focus:border-red-500' : 'border-[#273128] focus:border-[#B6FF4A]'
          } rounded-sm py-2.5 px-3.5 focus:outline-none transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
          {...props}
        />
        {error ? (
          <p className="text-xs text-red-400 font-mono">{error}</p>
        ) : helperText ? (
          <p className="text-xs text-[#A0AAA0]/70 font-mono">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
