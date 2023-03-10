import { useMatches, useRouteLoaderData } from '@remix-run/react';
import { useMemo } from 'react';
import { z } from 'zod';
import type { ROUTE_DEFS } from '~/routes';

type RouteId = Extract<(typeof ROUTE_DEFS)[keyof typeof ROUTE_DEFS], string>;
export interface RouteDataDef<T extends z.ZodTypeAny> {
  routeId: RouteId;
  schema: T;
}
export const makeRouteData = <T extends z.ZodTypeAny>(
  routeId: RouteId,
  schema: T
): RouteDataDef<T> => ({
  routeId,
  schema
});

export const useRouteData = <T extends z.ZodTypeAny>(def: RouteDataDef<T>): z.infer<T> => {
  return def.schema.parse(useRouteLoaderData(def.routeId));
};

export const useOptionalRouteData = <T extends z.ZodTypeAny>(
  def: RouteDataDef<T>
): z.infer<T> | null => {
  const matches = useMatches();
  const possibleData = matches.find((match) => match.id === def.routeId)?.data;
  if (possibleData === undefined) return null;
  const result = def.schema.safeParse(possibleData);
  if (!result.success) return null;
  return result.data;
};
