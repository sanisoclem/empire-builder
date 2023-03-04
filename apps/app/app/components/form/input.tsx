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
        className={`${showLabel ?? true ? 'block text-sm font-medium text-stone-700' : 'sr-only'}`}
      >
        {label}
      </label>
      <input
        id={id}
        ref={ref}
        placeholder={placeholder}
        className="block w-full rounded-none border-stone-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        name={name}
        {...props}
      />
      {errors && errors[name!]?.message && <FormError>{errors[name!]?.message}</FormError>}
    </div>
  );
});
