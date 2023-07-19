import { UserButton } from '@clerk/remix';
import { PageHeader } from '~components';
import { MoonIcon, Squares2X2Icon, SunIcon } from '@heroicons/react/24/outline';
import { useHotkeys } from 'react-hotkeys-hook';
import { ROUTES } from '~/routes';
import { useModal, useTheme } from '~hooks';

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
  const modals = useModal();
  useHotkeys(
    'mod+k',
    () => modals.openSwitcher(workspaces),
    {
      preventDefault: true
    },
    [workspaces]
  );

  const openSwitcher = () => {
    modals.openSwitcher(workspaces);
  };

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
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
        >
          {theme === 'dark' ? <SunIcon className="h-6 w-6" /> : <MoonIcon className="h-6 w-6" />}
        </button>
        <button
          onClick={openSwitcher}
          title="Switch Workspace"
          className="rounded-lg p-2 text-stone-500 hover:bg-stone-100 hover:text-stone-900 dark:text-stone-400 dark:hover:bg-stone-700 dark:hover:text-white"
        >
          <Squares2X2Icon className="h-6 w-6" />
        </button>
        <UserButton afterSignOutUrl={ROUTES.home} />
      </div>
    </div>
  );
}
