import { useLoaderData } from '@remix-run/react';
import { useMemo } from 'react';
import type { z } from 'zod';

export const useLoaderDataStrict = <T extends z.ZodTypeAny>(schema: T): z.infer<T> => {
  const data = useLoaderData();
  const parsed = useMemo(() => schema.parse(data), [data, schema]);
  return parsed;
};
