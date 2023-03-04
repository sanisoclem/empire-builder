export default function Card({
  children,
  className,
  ...props
}: React.HtmlHTMLAttributes<HTMLDivElement>) {
  return <div className={`rounded-sm bg-stone-50 shadow ${className ?? ''}`}>{children}</div>;
}
