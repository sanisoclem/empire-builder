import { Dialog, Transition } from '@headlessui/react';
import { useFetcher } from '@remix-run/react';
import { useAtom } from 'jotai';
import { Fragment } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { ROUTES } from '~/routes';
import { Button, Input, InputCombo, Textarea } from '~components';
import { accountModalAtom } from '~hooks';

export default function AccountModal() {
  const [state, setState] = useAtom(accountModalAtom);
  const fetcher = useFetcher();
  const { register, control } = useForm();
  const currencyObj = useWatch({ name: 'currencyObj', control });

  function handleSave() {}
  function handleCancel() {
    setState((f) => ({ ...f, open: false }));
  }

  return (
    <>
      <Transition appear show={state.open} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={handleCancel}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <fetcher.Form
            className="fixed inset-0 overflow-y-auto"
            action={ROUTES.workspace(state.workspaceId).createAccount}
            method="post"
          >
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform space-y-6 overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                    New Account
                  </Dialog.Title>
                  <div className="space-y-6">
                    <input type="hidden" name="workspaceId" value={state.workspaceId} />
                    <input type="hidden" name="currencyId" value={currencyObj?.id} />
                    <Input label="Account name" type="text" name="name" />
                    <Input label="Account Type" type="text" name="accountType" />
                    <Textarea label="Notes" placeholder="account notes" rows={4} name="notes" />
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
                        />
                      )}
                    />
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="neutral" onClick={handleCancel}>
                      Cancel
                    </Button>
                    <Button type="submit" onClick={handleSave} isLoading={fetcher.state !== 'idle'}>
                      Add new account
                    </Button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </fetcher.Form>
        </Dialog>
      </Transition>
    </>
  );
}
