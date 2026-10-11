import React from 'react';
import { cn } from '../utils/cn';
import { ChevronDown } from 'lucide-react';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { label: string; value: string }[];
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, options, ...props }, ref) => {
    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-slate-700 dark:text-slate-300">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            className={cn(
              'flex h-11 w-full appearance-none rounded-xl border border-border bg-white dark:bg-slate-900 px-3 py-2 pr-10 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all',
              error && 'border-rose-500 focus-visible:ring-rose-500',
              className
            )}
            ref={ref}
            {...props}
          >
            <option value="" disabled hidden>Select an option</option>
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-3 h-5 w-5 text-slate-400 pointer-events-none" />
        </div>
        {error && (
          <p className="text-[0.8rem] font-medium text-rose-500">{error}</p>
        )}
      </div>
    );
  }
);
Select.displayName = 'Select';

export { Select };
