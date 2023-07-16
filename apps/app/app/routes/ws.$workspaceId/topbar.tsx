import { UserButton } from '@clerk/remix';
import { Popover, Transition } from '@headlessui/react';
import { PageHeader } from '~components';
import {
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
      className={`relative flex h-16 items-center justify-between  gap-2 border-b border-solid border-stone-200 bg-white px-4 transition-colors dark:border-stone-700 dark:bg-stone-800 ${
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
          className="rounded-lg p-2 text-stone-500 hover:bg-stone-100 hover:text-stone-900 dark:text-stone-400 dark:hover:bg-stone-700 dark:hover:text-white"
          onClick={toggleDark}
        >
          {theme === 'dark' ? <SunIcon className="h-6 w-6" /> : <MoonIcon className="h-6 w-6" />}
        </button>

        <Popover className="relative">
          <Popover.Button className="rounded-lg p-2 text-stone-500 hover:bg-stone-100 hover:text-stone-900 dark:text-stone-400 dark:hover:bg-stone-700 dark:hover:text-white">
            <Squares2X2Icon className="h-6 w-6" />
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
              <div className="overflow-hidden rounded bg-white tracking-wider text-stone-700 shadow-lg ring-1 ring-stone-200 ring-opacity-5 dark:bg-stone-800 dark:text-white dark:ring-stone-700">
                <div className="border-b border-solid border-stone-200 py-4 text-center font-semibold dark:border-stone-700">
                  Workspaces
                </div>
                <div className=" flex gap-6 p-6">
                  {workspaces.map((w) => (
                    <Link
                      to={ROUTES.workspace(w.id).dashboard}
                      key={w.id}
                      className="group cursor-pointer gap-y-1 rounded p-1 text-stone-500 hover:bg-stone-500 hover:text-white dark:text-stone-500 dark:hover:text-white"
                    >
                      <div className="flex h-20 w-20 flex-col items-center justify-center rounded p-1 group-hover:text-white">
                        <WalletIcon className="h-12 w-12 flex-none" />
                      </div>
                      <div className="flex-1 text-center text-sm font-semibold">{w.name}</div>
                    </Link>
                  ))}
                  <Link
                    to={ROUTES.createWorkspace}
                    className="group cursor-pointer gap-y-1 rounded p-1 hover:bg-indigo-500 hover:text-white"
                  >
                    <div className="flex h-20 w-20 flex-col items-center justify-center rounded p-1 text-indigo-500 group-hover:text-white">
                      <PlusCircleIcon className="h-12 w-12 flex-none" />
                    </div>
                    <div className="flex-1 text-center text-sm font-semibold">Create</div>
                  </Link>
                </div>
              </div>
            </Popover.Panel>
          </Transition>
          <Popover.Overlay className="fixed inset-0 z-10 bg-black/25 backdrop-blur transition-all" />
        </Popover>
        <UserButton afterSignOutUrl={ROUTES.home} />
      </div>
    </div>
  );
}
