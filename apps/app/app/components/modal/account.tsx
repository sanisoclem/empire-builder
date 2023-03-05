import { useFetcher } from '@remix-run/react';
import { useAtom } from 'jotai';
import { useEffect, useRef, useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { ROUTES } from '~/routes';
import { Button, Input, InputCombo, Textarea } from '~components';
import { accountModalAtom } from '~hooks';
import { createModal } from './wrapper';
import { useFetch } from 'usehooks-ts';

const accountFormSchema = z.object({
  name: z.string().min(1, { message: 'name is required' }).max(100),
  accountType: z.string().max(100).nullable(),
  notes: z.string().max(1024).nullable(),
  currencyObj: z.object(
    { id: z.string(), name: z.string() },
    { required_error: 'currency is required' }
  )
});

function AccountModal() {
  const [state, setState] = useAtom(accountModalAtom);
  const fetcher = useFetcher();
  const {
    control,
    handleSubmit,
    formState: { errors },
    register
  } = useForm<z.infer<typeof accountFormSchema>>({ resolver: zodResolver(accountFormSchema) });
  const values = useWatch({ control });

  function handleSave() {
    const parsed = accountFormSchema.parse(values);
    fetcher.submit(
      {
        workspaceId: state.workspaceId,
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
  }
  function handleCancel() {
    setState((f) => ({ ...f, open: false }));
  }

  useEffect(() => {
    if (fetcher.type === 'done') handleCancel();
  }, [fetcher.type]);

  const handleError = (e: unknown) => {
    console.log(e);
  };

  return (
    <>
      <fetcher.Form className="space-y-6" onSubmit={handleSubmit(handleSave, handleError)}>
        <Input
          label="Account name"
          placeholder="a descriptive name, you can change this later"
          type="text"
          {...register('name')}
          errors={errors}
        />
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
            Add new account
          </Button>
        </div>
      </fetcher.Form>
    </>
  );
}

export default createModal(AccountModal, accountModalAtom);
