import { PageHeader } from '../typography';
import { UserButton } from '@clerk/remix';
import { Popover, Transition } from '@headlessui/react';
import {
  BanknotesIcon,
  MoonIcon,
  PlusCircleIcon,
  Squares2X2Icon,
  SunIcon,
  WalletIcon
} from '@heroicons/react/24/outline';
import { Link } from '@remix-run/react';
import { Fragment } from 'react';
import { ROUTES } from '~/routes';
import { useTheme } from '~hooks';

export type TopbarProps = {
  mode: string;
  workspaces: Array<{ name: string; id: string }>;
  user: {
    avatar: string;
    displayName: string;
  };
} & React.HtmlHTMLAttributes<HTMLDivElement>;

export default function Topbar({ className, mode, user, workspaces, ...props }: TopbarProps) {
  const { theme, setTheme } = useTheme();

  const toggleDark = () => {
    if (theme === null) return;
    setTheme((t) => (t === 'light' ? 'dark' : 'light'));
  };
  return (
    <div
      className={`relative border-b border-solid dark:border-stone-700 border-stone-200  flex h-16 items-center justify-between gap-2 transition-colors bg-white dark:bg-stone-800 px-4 ${
        className ?? ''
      }`}
      {...props}
    >
      <div className="absolute inset-y-0 right-0 flex w-full flex-none items-center gap-x-4 pr-4">
        <div className="flex-1 justify-self-start px-6">
          <PageHeader></PageHeader>
          <p className="text-sm text-stone-500"></p>
        </div>
        <button
          type="button"
          className="p-2 text-stone-500 rounded-lg hover:text-stone-900 hover:bg-stone-100 dark:text-stone-400 dark:hover:text-white dark:hover:bg-stone-700"
          onClick={toggleDark}
        >
          {theme === 'dark' ? <SunIcon className="w-6 h-6" /> : <MoonIcon className="w-6 h-6" />}
        </button>

        <Popover className="relative">
          <Popover.Button className="p-2 text-stone-500 rounded-lg hover:text-stone-900 hover:bg-stone-100 dark:text-stone-400 dark:hover:text-white dark:hover:bg-stone-700">
            <Squares2X2Icon className="w-6 h-6" />
          </Popover.Button>
          <Transition
            as={Fragment}
            enter="transition ease-out duration-200"
            enterFrom="opacity-0 transtone-y-1"
            enterTo="opacity-100 transtone-y-0"
            leave="transition ease-in duration-150"
            leaveFrom="opacity-100 transtone-y-0"
            leaveTo="opacity-0 transtone-y-1"
          >
            <Popover.Panel className="absolute right-0 z-20 mt-10 max-w-sm transform px-4 sm:px-0 lg:max-w-3xl">
              <div className="overflow-hidden rounded tracking-wider shadow-lg ring-1 ring-stone-200 dark:ring-stone-700 ring-opacity-5 text-stone-700 dark:text-white dark:bg-stone-800 bg-white">
                <div className="border-b font-semibold border-solid dark:border-stone-700 border-stone-200 text-center py-4">
                  Workspaces
                </div>
                <div className=" p-6 flex gap-6">
                  {workspaces.map((w) => (
                    <Link
                      to={ROUTES.workspace(w.id).dashboard}
                      key={w.id}
                      className="cursor-pointer group text-stone-500 hover:bg-stone-500 hover:text-white dark:hover:text-white dark:text-stone-500 p-1 gap-y-1 rounded"
                    >
                      <div className="h-20 w-20 flex-col p-1 rounded group-hover:text-white flex justify-center items-center">
                        <WalletIcon className="h-12 w-12 flex-none" />
                      </div>
                      <div className="text-sm font-semibold text-center flex-1">{w.name}</div>
                    </Link>
                  ))}
                  <Link
                    to={ROUTES.createWorkspace}
                    className="cursor-pointer group hover:bg-indigo-500 hover:text-white p-1 gap-y-1 rounded"
                  >
                    <div className="h-20 w-20 flex-col p-1 text-indigo-500 rounded group-hover:text-white flex justify-center items-center">
                      <PlusCircleIcon className="h-12 w-12 flex-none" />
                    </div>
                    <div className="text-sm font-semibold text-center flex-1">Create</div>
                  </Link>
                </div>
              </div>
            </Popover.Panel>
          </Transition>
          <Popover.Overlay className="fixed inset-0 z-10 transition-all bg-black/25 backdrop-blur" />
        </Popover>
        <UserButton afterSignOutUrl={ROUTES.home} />
      </div>
    </div>
  );
}
