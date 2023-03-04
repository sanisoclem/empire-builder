import FormError from './form-error';
import React from 'react';

type InputProps = React.DetailedHTMLProps<
  React.TextareaHTMLAttributes<HTMLTextAreaElement>,
  HTMLTextAreaElement
> & {
  id?: string;
  showLabel?: boolean;
  label?: string;
  errors?: Record<string, { message?: string } | undefined>;
};

export default React.forwardRef<HTMLTextAreaElement, InputProps>(function Textarea(
  { id, showLabel, label, className, placeholder, errors, name, ...props }: InputProps,
  ref?
) {
  return (
    <div className={` ${className ?? ''}`}>
      <label
        htmlFor={id}
        className={`${showLabel ?? true ? 'block text-sm font-medium text-stone-700' : 'sr-only'}`}
      >
        {label}
      </label>
      <textarea
        id={id}
        ref={ref}
        placeholder={placeholder}
        name={name}
        className="block w-full rounded-none border-stone-300 focus:border-indigo-500 focus:ring-indigo-500 disabled:bg-stone-100 sm:text-sm"
        {...props}
      />
      {errors && errors[name!]?.message && <FormError>{errors[name!]?.message}</FormError>}
    </div>
  );
});
