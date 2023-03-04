import { Link, useLocation, useResolvedPath, useTransition } from '@remix-run/react';
import type { RemixLinkProps } from '@remix-run/react/dist/components';

type Props = RemixLinkProps;

export default function PendingLink({ to, children, ...props }: Props) {
  const transition = useTransition();
  const location = useLocation();
  const path = useResolvedPath(to);

  const isPending =
    transition.state === 'loading' && transition.location.pathname === path.pathname;
  const isCurrent = transition.state === 'idle' && location.pathname === path.pathname;

  return (
    <Link
      data-current={isCurrent}
      data-pending={isPending ? 'true' : null}
      to={to}
      children={children}
      {...props}
    />
  );
}
