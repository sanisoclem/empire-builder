type FieldsetProps = React.DetailedHTMLProps<
  React.FieldsetHTMLAttributes<HTMLFieldSetElement>,
  HTMLFieldSetElement
> & { legend: string };

export default function Fieldset({ legend, className, children, ...props }: FieldsetProps) {
  return (
    <fieldset className={`${className ?? ''}`} {...props}>
      <legend className="sr-only">{legend}</legend>
      <div className="text-base font-medium text-stone-900" aria-hidden="true">
        {legend}
      </div>
      {children}
    </fieldset>
  );
}
