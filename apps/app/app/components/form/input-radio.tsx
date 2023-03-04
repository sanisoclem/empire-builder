import React from 'react';

type Props = { helpText: string; label: string } & React.DetailedHTMLProps<
  React.InputHTMLAttributes<HTMLInputElement>,
  HTMLInputElement
>;
export default React.forwardRef<HTMLInputElement, Props>(function InputRadio(
  { label, helpText, className, placeholder, ...props }: Props,
  ref?
) {
  return (
    <label className={`${className ?? ''} flex items-start`}>
      <div className="flex h-5 items-center">
        <input
          ref={ref}
          type="radio"
          className="h-4 w-4 border-stone-300 text-indigo-600 focus:ring-indigo-500"
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
