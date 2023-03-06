import { useFetcher } from '@remix-run/react';
import { atom, useAtom } from 'jotai';
import { useEffect } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { ROUTES } from '~/routes';
import { Button, Input, InputCombo, Textarea } from '~components';
import { createModal } from './wrapper';

export type Currency = { id: string; name: string; precision: number };
export type AccountModalState = {
  open: boolean;
  title: string;
  workspaceId: string;
  editing: {
    id: number;
    name: string;
    type: string | null;
    notes: string | null;
  } | null;
  currencies: Currency[];
};

const commonFields = z.object({
  name: z.string().min(1, { message: 'name is required' }).max(100),
  accountType: z.string().max(100).nullable(),
  notes: z.string().max(1024).nullable()
});
const formSchema = z.union([
  z.intersection(z.object({ id: z.number() }), commonFields),
  z.intersection(
    z.object({
      currencyObj: z.object(
        { id: z.string(), name: z.string() },
        { required_error: 'currency is required' }
      )
    }),
    commonFields
  )
]);

export const accountModalAtom = atom<AccountModalState>({
  workspaceId: '',
  title: '',
  open: false,
  editing: null,
  currencies: []
});

function AccountModal() {
  const [state, setState] = useAtom(accountModalAtom);
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
            id: state.editing.id,
            accountType: state.editing.type,
            name: state.editing.name,
            notes: state.editing.notes
          }
        : undefined,
    resolver: zodResolver(formSchema)
  });
  
  function handleSave(values: unknown) {
    const parsed = formSchema.parse(values);
    if ('currencyObj' in parsed) {
      fetcher.submit(
        {
          currencyId: parsed.currencyObj.id,
          name: parsed.name,
          accountType: parsed.accountType ?? '',
          notes: parsed.notes ?? ''
        },
        {
          action: ROUTES.workspace(state.workspaceId).createAccount,
          method: 'post'
        }
      );
    } else {
      fetcher.submit(
        {
          name: parsed.name,
          accountType: parsed.accountType ?? '',
          notes: parsed.notes ?? ''
        },
        {
          action: ROUTES.workspace(state.workspaceId).account(parsed.id.toString()).update,
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
        {state.editing !== null && (
          <input type="hidden" {...register('id', { value: state.editing.id })} />
        )}
        <Input
          label="Account name"
          placeholder="a descriptive name, you can change this later"
          type="text"
          {...register('name')}
          errors={errors}
        />
        {state.editing === null && (
          <Controller
            name="currencyObj"
            control={control}
            render={({ field }) => (
              <InputCombo
                label="Denomination"
                choices={state.currencies.map((c) => ({
                  id: c.id,
                  name: `${c.name} (${c.id})`
                }))}
                placeholder="denomination"
                {...field}
                errors={errors}
              />
            )}
          />
        )}
        <Input
          label="Account Type"
          type="text"
          {...register('accountType')}
          placeholder="e.g., Cash Account, Settlement Account"
          errors={errors}
        />
        <Textarea
          label="Notes"
          placeholder="account notes"
          rows={4}
          {...register('notes')}
          errors={errors}
        />

        <div className="flex justify-end gap-2">
          <Button type="button" variant="neutral" onClick={handleCancel}>
            Cancel
          </Button>
          <Button type="submit" isLoading={fetcher.state !== 'idle'}>
            {state.editing === null ? 'Add new account' : 'Update account'}
          </Button>
        </div>
      </fetcher.Form>
    </>
  );
}

export default createModal(AccountModal, accountModalAtom);
