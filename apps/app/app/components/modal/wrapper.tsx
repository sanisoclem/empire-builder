import { Dialog, Transition } from '@headlessui/react';
import { PrimitiveAtom, useAtom } from 'jotai';
import { Fragment } from 'react';

export const createModal =
  <T extends { open: boolean; title: string }>(
    Modal: (p: T) => JSX.Element,
    atom: PrimitiveAtom<T>
  ) =>
  () => {
    const [state, setState] = useAtom(atom);

    const handleClose = () => {
      setState((s) => ({ ...s, open: false }));
    };
    return (
      <>
        <Transition appear show={state.open} as={Fragment}>
          <Dialog as="div" className="relative z-10" onClose={handleClose}>
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-black/25 backdrop-blur" />
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
                  <Dialog.Panel className="w-full max-w-md transform space-y-6 overflow-hidden rounded-2xl bg-white dark:bg-stone-800 p-6 text-left align-middle shadow-xl transition-all">
                    <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-stone-900 dark:text-stone-50">
                      {state.title}
                    </Dialog.Title>
                    {state.open && <Modal {...state} />}
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </Dialog>
        </Transition>
      </>
    );
  };
