import FormError from './form-error';
import React from 'react';

type InputProps = React.DetailedHTMLProps<
  React.InputHTMLAttributes<HTMLInputElement>,
  HTMLInputElement
> & {
  id?: string;
  showLabel?: boolean;
  label?: string;
  errors?: Record<string, { message?: string } | undefined>;
};

export default React.forwardRef<HTMLInputElement, InputProps>(function Input(
  { id, showLabel, label, className, placeholder, errors, name, ...props }: InputProps,
  ref?
) {
  return (
    <div className={`space-y-2 ${className ?? ''}`}>
      <label
        htmlFor={id}
        className={`${showLabel ?? true ? 'block text-sm font-medium dark:text-stone-300 text-stone-700' : 'sr-only'}`}
      >
        {label}
      </label>
      <input
        id={id}
        ref={ref}
        placeholder={placeholder}
        className="block w-full rounded-md border-stone-400 bg-stone-50 text-stone-600 focus:border-sky-500 focus:bg-white focus:text-stone-900 focus:ring-sky-500 dark:bg-stone-700 dark:text-stone-400 dark:focus:text-stone-200 sm:text-sm"
        name={name}
        {...props}
      />
      {errors && errors[name!]?.message && <FormError>{errors[name!]?.message}</FormError>}
    </div>
  );
});
