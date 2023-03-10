import React from 'react';

type Props = { helpText?: string; label?: string } & React.DetailedHTMLProps<
  React.InputHTMLAttributes<HTMLInputElement>,
  HTMLInputElement
>;
export default React.forwardRef<HTMLInputElement, Props>(function InputCheck(
  { label, helpText, className, placeholder, ...props }: Props,
  ref?
) {
  return (
    <label className={`${className ?? ''} flex items-start`}>
      <div className="flex h-5 items-center">
        <input
          ref={ref}
          type="checkbox"
          className="focus:ring-3 h-4 w-4 rounded border-stone-300 bg-stone-50 focus:ring-indigo-500 dark:border-stone-600 dark:bg-stone-700 dark:ring-offset-stone-800 dark:focus:ring-indigo-500"
          {...props}
        />
      </div>
      <div className="ml-3 text-sm">
        <div className="font-medium text-stone-700">{label}</div>
        <p className="text-stone-500">{helpText}</p>
      </div>
    </label>
  );
});
