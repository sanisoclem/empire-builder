import type { z } from 'zod';

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
