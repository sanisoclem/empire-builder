import {
  BanknotesIcon,
  CalculatorIcon,
  ChartPieIcon,
  ChevronDoubleRightIcon,
  HomeModernIcon,
  PresentationChartBarIcon,
  PresentationChartLineIcon,
  RectangleGroupIcon,
  RectangleStackIcon
} from '@heroicons/react/24/outline';
import { ChevronDoubleLeftIcon } from '@heroicons/react/24/solid';
import { Link, useLocation, useTransition } from '@remix-run/react';
import { z } from 'zod';
import { ROUTES } from '~/routes';
import { useLocalStorageStrict } from '~hooks';

export type SidebarProps = {
  workspaceId: string;
  version: string;
} & React.HtmlHTMLAttributes<HTMLDivElement>;

export default function Sidebar({ workspaceId, className, version, ...props }: SidebarProps) {
  const location = useLocation();
  const transition = useTransition();
  const [expanded, setExpanded] = useLocalStorageStrict('sidebar', z.boolean(), true);
  const nav = [
    {
      href: ROUTES.workspace(workspaceId).dashboard,
      label: 'Dashboard',
      icon: <ChartPieIcon className="h-6 w-6" />
    },
    {
      href: ROUTES.workspace(workspaceId).account.list,
      label: 'Accounts',
      icon: <RectangleStackIcon className="h-6 w-6" />
    },
    {
      href: ROUTES.workspace(workspaceId).stock.manage,
      label: 'Stock Portfolio',
      icon: <PresentationChartLineIcon className="h-6 w-6" />
    },
    {
      href: ROUTES.workspace(workspaceId).otherAssets.manage,
      label: 'Other Assets',
      icon: <HomeModernIcon className="h-6 w-6" />
    },
    {
      href: ROUTES.workspace(workspaceId).bucket.budget,
      label: 'Budget',
      icon: <CalculatorIcon className="h-6 w-6" />
    }
  ];

  const navPending = transition.state !== 'idle';
  const currentPath = navPending
    ? transition.location.pathname ?? location.pathname
    : location.pathname;
  const activeHref = nav
    .map<string>((l) => l.href)
    .filter((l) => currentPath.startsWith(l))
    .reduce((a, b) => (a.length > b.length ? a : b), '');

  const toggleSidebar = () => {
    setExpanded((s) => !s);
  };

  return (
    <div
      data-state={expanded ? 'expanded' : ''}
      className={`sidebar group flex w-20 flex-col items-stretch border-r border-solid border-stone-300 bg-indigo-900 text-white transition-all data-[state=expanded]:w-72 dark:border-stone-600 dark:bg-stone-800 dark:text-white ${
        className ?? ''
      }`}
      {...props}
    >
      <div className="flex h-[4rem] items-center justify-start px-6">
        <Link to="/" className="text-2xl">
          <span className="bg-gradient-to-r  from-indigo-500  to-pink-400 bg-clip-text font-extrabold transition-colors dark:text-transparent">
            {expanded ? 'Empire' : 'E'}
          </span>
          <span className="text-stone-300">{expanded ? 'builder' : 'b'}</span>
        </Link>
      </div>
      <div className="flex-1 space-y-6 py-6">
        <ul className="flex flex-col gap-y-2">
          {nav.map((l) => (
            <li key={l.href}>
              <Link
                data-state={expanded ? 'expanded' : 'collapsed'}
                data-current={l.href === activeHref ? 'true' : ''}
                data-pending={l.href === activeHref && navPending ? 'true' : ''}
                className="mx-4 flex gap-x-2 rounded-lg from-sky-300 to-sky-400/90 p-2 text-stone-200 outline-none transition-colors hover:bg-white/10 hover:text-white data-[pending=true]:animate-pulse data-[state=expanded]:justify-start data-[state=collapsed]:justify-center data-[current=true]:bg-gradient-to-r data-[pending=true]:bg-gradient-to-r data-[current=true]:text-stone-900 dark:from-sky-700  dark:to-sky-600/90 dark:text-stone-300 dark:hover:bg-white/10 dark:hover:text-white dark:data-[current=true]:text-white"
                to={l.href}
              >
                <span className="flex-none">{l.icon}</span>
                <span className="hidden whitespace-nowrap group-data-[state=expanded]:inline">
                  {l.label}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <div
        className="overflow-hidden text-ellipsis p-1 py-1 text-center font-mono text-[0.6rem]"
        title={version}
      >
        {version}
      </div>
      <button
        className="flex-none justify-self-end bg-white/5 p-2 text-center hover:bg-white/10 hover:bg-opacity-50"
        onClick={toggleSidebar}
      >
        {!expanded && <ChevronDoubleRightIcon className="inline-block w-6" />}
        {expanded && <ChevronDoubleLeftIcon className="inline-block w-6" />}
      </button>
    </div>
  );
}
