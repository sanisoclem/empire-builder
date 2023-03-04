import { Dialog, Transition } from '@headlessui/react';
import { Form, useTransition } from '@remix-run/react';
import { Fragment, useEffect, useState } from 'react';
import { ROUTES } from '~/routes';
import { Button, Input, Textarea } from '~components';

type Props = {
  isOpen: boolean;
  accountName: string;
  accountNotes: string;
  accountId: string;
  ledgerId: string;
  onClose: () => void;
};

export default function AccountEditModal({ isOpen, onClose, ledgerId, ...props }: Props) {
  const transition = useTransition();
  const [hasSaved, setHasSaved] = useState(false);
  let isEditing =
    transition.state === 'submitting' &&
    transition.submission.formData.get('_action') === 'EditAccount';

  useEffect(() => {
    if (isEditing) setHasSaved(true);
  }, [isEditing]);
  useEffect(() => {
    if (!isEditing && hasSaved) {
      onClose();
      setHasSaved(false);
    }
  }, [isEditing, onClose, hasSaved]);

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={onClose} static>
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

        <Form
          replace
          className="fixed inset-0 overflow-y-auto"
          method="post"
          action={ROUTES.ledger(ledgerId).account(props.accountId).edit}
        >
          <input type="hidden" name="_action" value="EditAccount" />
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
              <Dialog.Panel className="w-full max-w-md transform space-y-6 overflow-hidden rounded-sm bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-zinc-900">
                  Edit Account
                </Dialog.Title>
                <div className="space-y-6">
                  <Input
                    type="text"
                    label="Name"
                    placeholder="account name"
                    defaultValue={props.accountName}
                    name="name"
                  />
                  <Textarea
                    label="Notes"
                    placeholder="account notes"
                    defaultValue={props.accountNotes}
                    rows={10}
                    name="notes"
                  />
                </div>

                <div className="mt-4">
                  <Button type="submit" isLoading={transition.state !== 'idle'}>
                    Save
                  </Button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Form>
      </Dialog>
    </Transition>
  );
}
