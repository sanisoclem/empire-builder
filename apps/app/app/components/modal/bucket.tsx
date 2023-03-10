import { useFetcher } from '@remix-run/react';
import { atom, useAtom } from 'jotai';
import { useEffect } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { ROUTES } from '~/routes';
import { Button, Input, InputCombo, Textarea } from '~components';
import { createModal } from './wrapper';

export type BucketModalState = {
  open: boolean;
  title: string;
  workspaceId: string;
  editing: {
    id: number;
    name: string;
    category: string | null;
  } | null;
};

const formSchema = z.object({
  name: z.string().min(1, { message: 'name is required' }).max(100),
  category: z.string().max(100).nullable()
});

export const bucketModalAtom = atom<BucketModalState>({
  workspaceId: '',
  title: '',
  open: false,
  editing: null
});

function BucketModal() {
  const [state, setState] = useAtom(bucketModalAtom);
  const fetcher = useFetcher();
  const {
    control,
    handleSubmit,
    formState: { errors },
    register
  } = useForm<z.infer<typeof formSchema>>({
    defaultValues:
      state.editing !== null
        ? {
            name: state.editing.name,
            category: state.editing.category
          }
        : undefined,
    resolver: zodResolver(formSchema)
  });

  function handleSave(v: unknown) {
    const parsed = formSchema.parse(v);

    if (state.editing === null) {
      fetcher.submit(
        {
          name: parsed.name,
          category: parsed.category ?? ''
        },
        {
          action: ROUTES.workspace(state.workspaceId).bucket.create,
          method: 'post'
        }
      );
    } else {
      fetcher.submit(
        {
          bucketId: state.editing.id.toString(),
          name: parsed.name,
          category: parsed.category ?? ''
        },
        {
          action: ROUTES.workspace(state.workspaceId).bucket.item(state.editing.id.toString())
            .update,
          method: 'post'
        }
      );
    }
  }
  function handleCancel() {
    setState((f) => ({ ...f, open: false }));
  }

  useEffect(() => {
    if (fetcher.type === 'done') handleCancel();
  }, [fetcher.type]);

  return (
    <>
      <fetcher.Form className="space-y-6" onSubmit={handleSubmit(handleSave)}>
        <Input
          label="Name"
          placeholder="give it a descriptive name"
          type="text"
          {...register('name')}
          errors={errors}
        />
        <Input
          label="Category"
          type="text"
          {...register('category')}
          placeholder="e.g., Income, Long Term Expense, Discretionary Expense"
          errors={errors}
        />

        <div className="flex justify-end gap-2">
          <Button type="button" variant="neutral" onClick={handleCancel}>
            Cancel
          </Button>
          <Button type="submit" isLoading={fetcher.state !== 'idle'}>
            {state.editing === null ? 'Add new bucket' : 'Update bucket'}
          </Button>
        </div>
      </fetcher.Form>
    </>
  );
}

export default createModal(BucketModal, bucketModalAtom);
