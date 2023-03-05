import { Menu, Portal, Transition } from '@headlessui/react';
import {
  ArchiveBoxXMarkIcon,
  BanknotesIcon,
  EllipsisVerticalIcon,
  PencilIcon
} from '@heroicons/react/24/outline';
import { Fragment } from 'react';
import { usePopper } from '~hooks';

type Props = {
  onRename?: () => void;
  onTransactions?: () => void;
  onCloseAccount?: () => void;
};

export default function AccountMenu({ onRename, onTransactions, onCloseAccount }: Props) {
  let [trigger, container] = usePopper({
    placement: 'bottom-end',
    strategy: 'fixed',
    modifiers: [
      {
        name: 'flip',
        options: {
          rootBoundary: 'viewport',
          fallbackPlacements: ['bottom-end', 'top-end']
        }
      }
    ]
  });

  return (
    <>
      <Menu as="div" className="inline-block">
        <div>
          <Menu.Button ref={trigger} className="">
            <EllipsisVerticalIcon className="h-6 w-auto" aria-hidden="true" />
          </Menu.Button>
        </div>
        <Portal>
          <Transition
            as={Fragment}
            enter="transition-opacity ease-out duration-100"
            enterFrom="transform opacity-0"
            enterTo="transform opacity-100"
            leave="transition-opacity ease-in duration-75"
            leaveFrom="transform opacity-100"
            leaveTo="transform opacity-0"
          >
            <Menu.Items ref={container} className="w-56 divide-y divide-stone-300 rounded-lg bg-stone-50 drop-shadow-2xl ring-1 ring-stone-900 ring-opacity-20 focus:outline-none">
              <div className="px-1 py-1 ">
                <Menu.Item>
                  <button className="menu-item group" onClick={() => onTransactions?.()}>
                    Transactions
                  </button>
                </Menu.Item>
              </div>
              <div className="px-1 py-1 ">
                <Menu.Item>
                  <button className="menu-item" onClick={() => onRename?.()}>
                    Edit
                  </button>
                </Menu.Item>
                <Menu.Item>
                  <button className="menu-item" onClick={() => onCloseAccount?.()}>
                    Close Account
                  </button>
                </Menu.Item>
              </div>
            </Menu.Items>
          </Transition>
        </Portal>
      </Menu>
    </>
  );
}
