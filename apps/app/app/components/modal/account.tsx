import { Dialog, Transition } from '@headlessui/react';
import { useAtom } from 'jotai';
import { Fragment } from 'react';
import { Input, InputCombo, Textarea } from '~components';
import { accountModalAtom } from '~hooks';

export default function AccountModal() {
  const [state, setState] = useAtom(accountModalAtom);

  function closeModal() {
    setState((f) => ({ ...f, open: false }));
  }

  return (
    <>
      <Transition appear show={state.open} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={closeModal}>
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

          <div className="fixed inset-0 overflow-y-auto">
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
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 space-y-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                    New Account
                  </Dialog.Title>
                  <div className="">
                    <p className="text-sm text-gray-500">
                      Your payment has been successfully submitted. We’ve sent you an email with all
                      of the details of your order.
                    </p>
                    <Input label="Account name" type="text" name="name" />
                    <Textarea label="Notes" placeholder="account notes" rows={4} name="notes" />
                    <InputCombo
                      label="Denomination"
                      choices={[]}
                      placeholder="denomination"
                      name="denominationObj"
                    />
                  </div>

                  <div className="">
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-transparent bg-indigo-100 px-4 py-2 text-sm font-medium text-indigo-900 hover:bg-indigo-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
                      onClick={closeModal}
                    >
                      Got it, thanks!
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}
