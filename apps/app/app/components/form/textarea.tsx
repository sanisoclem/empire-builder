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
  noresize?: boolean;
  variant?: 'sm' | 'base';
};

export default React.forwardRef<HTMLTextAreaElement, InputProps>(function Textarea(
  {
    id,
    showLabel,
    label,
    className,
    placeholder,
    errors,
    name,
    variant,
    noresize,
    ...props
  }: InputProps,
  ref?
) {
  return (
    <div className={` ${className ?? 'space-y-2'}`}>
      {(!!label ?? true) && (
        <label
          htmlFor={id}
          className={`${
            showLabel ?? true
              ? 'block text-sm font-medium text-stone-700 dark:text-stone-300'
              : 'sr-only'
          }`}
        >
          {label}
        </label>
      )}

      <textarea
        id={id}
        ref={ref}
        data-variant={variant}
        data-noresize={(noresize ?? false).toString()}
        placeholder={placeholder}
        name={name}
        className={`${props.rows === 1 ? 'h-8' : ''} block w-full rounded-md border-stone-400 bg-stone-50 text-stone-600 focus:border-sky-500 focus:bg-white focus:text-stone-900 focus:ring-sky-500 data-[noresize=true]:resize-none data-[variant=sm]:p-1 dark:bg-stone-700 dark:text-stone-400 dark:placeholder:text-stone-400 dark:focus:text-stone-200 sm:text-sm`}
        {...props}
      />
      {errors && errors[name!]?.message && <FormError>{errors[name!]?.message}</FormError>}
    </div>
  );
});
