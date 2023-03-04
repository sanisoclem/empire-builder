import type { RemixLinkProps } from '@remix-run/react/dist/components';
import PendingLink from './pending-link';

type ButtonLinkProps = RemixLinkProps & {
  variant?: 'primary' | 'neutral' | 'danger';
};

export default function ButtonLink({ children, className, variant, ...props }: ButtonLinkProps) {
  return (
    <PendingLink className={`btn btn-${variant ?? 'primary'} ${className ?? ''}`} {...props}>
      {children}
    </PendingLink>
  );
}
