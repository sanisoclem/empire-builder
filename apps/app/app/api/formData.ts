import { useFetcher } from '@remix-run/react';
import { DataFunctionArgs } from '@remix-run/server-runtime';
import type { z, ZodTypeAny } from 'zod';

export const getFormDataStrict = async <T extends z.ZodTypeAny>(
  request: Request,
  schema: T
): Promise<z.infer<T>> => {
  const formData = Object.fromEntries(await request.formData());
  const result = schema.safeParse(formData);
  if (!result.success)
    throw new Response('Bad request', {
      status: 400
    });
  return result.data;
};

export const getJsonRequest = async <T extends ZodTypeAny>(
  args: DataFunctionArgs,
  payloadSchema: T
): Promise<z.infer<T>> => {
  const formData = await args.request.formData();
  const raw = formData.get('request');

  if (typeof raw !== 'string') throw new Response('Bad Request', { status: 400 });

  const payload = payloadSchema.safeParse(JSON.parse(raw));

  if (!payload.success) {
    console.log(payload.error);
    throw new Response('Bad Request', { status: 400 });
  }
  return payload.data;
};

export const submitJsonRequest = <T extends ZodTypeAny, F>(
  fetcher: ReturnType<typeof useFetcher<F>>,
  route: string,
  schema: T,
  data: z.infer<T>
) => {
  fetcher.submit(
    {
      request: JSON.stringify(data)
    },
    {
      method: 'post',
      action: route
    }
  );
};
