import React from 'react';
import { cn } from '../utils/cn';

interface SwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  label?: string;
  description?: string;
}

export const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, checked, onCheckedChange, label, description, ...props }, ref) => {
    const handleToggle = () => {
      if (!props.disabled && onCheckedChange) {
        onCheckedChange(!checked);
      }
    };

    return (
      <div className="flex items-center justify-between">
        {(label || description) && (
          <div className="mr-4">
            {label && <label className="text-sm font-medium text-slate-900 dark:text-white cursor-pointer" onClick={handleToggle}>{label}</label>}
            {description && <p className="text-xs text-slate-500 dark:text-slate-400">{description}</p>}
          </div>
        )}
        <button
          type="button"
          role="switch"
          aria-checked={checked}
          onClick={handleToggle}
          disabled={props.disabled}
          className={cn(
            "relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900",
            checked ? "bg-primary-600" : "bg-slate-200 dark:bg-slate-700",
            props.disabled && "opacity-50 cursor-not-allowed",
            className
          )}
        >
          <span
            aria-hidden="true"
            className={cn(
              "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
              checked ? "translate-x-5" : "translate-x-0"
            )}
          />
        </button>
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onCheckedChange?.(e.target.checked)}
          className="hidden"
          ref={ref}
          {...props}
        />
      </div>
    );
  }
);

Switch.displayName = 'Switch';
