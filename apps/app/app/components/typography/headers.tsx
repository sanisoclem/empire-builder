export const PageHeader = ({
  className,
  ...props
}: React.HtmlHTMLAttributes<HTMLHeadingElement>) => (
  <h2 className={`text-2xl font-semibold ${className ?? ''}`} {...props}></h2>
);

export const SectionHeader = ({
  className,
  ...props
}: React.HtmlHTMLAttributes<HTMLHeadingElement>) => (
  <h3 className={`text-xl font-semibold ${className ?? ''}`} {...props}></h3>
);

export const WidgetHeader = ({
  className,
  ...props
}: React.HtmlHTMLAttributes<HTMLHeadingElement>) => (
  <h4 className={`text-lg font-semibold ${className ?? ''}`} {...props}></h4>
);
