import { Link, useLocation, useNavigation, useResolvedPath } from '@remix-run/react';
import type { RemixLinkProps } from '@remix-run/react/dist/components';

type Props = RemixLinkProps;

export default function PendingLink({ to, children, ...props }: Props) {
  const nav = useNavigation();
  const location = useLocation();
  const path = useResolvedPath(to);

  const isPending =
    nav.state === 'loading' && nav.location.pathname === path.pathname;
  const isCurrent = nav.state === 'idle' && location.pathname === path.pathname;

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
