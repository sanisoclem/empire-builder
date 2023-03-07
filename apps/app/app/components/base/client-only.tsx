import { ReactNode } from "react";
import { useHydrated } from "~hooks";

type Props = {
  children(): ReactNode;
  fallback?: ReactNode;
};

export default function ClientOnly({ children, fallback = null }: Props) {
  return useHydrated() ? <>{children()}</> : <>{fallback}</>;
}