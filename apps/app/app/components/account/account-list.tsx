import AccountMenu from './account-menu';
import {
  ArrowSmallDownIcon,
  ArrowSmallUpIcon,
  MinusIcon,
  PlusIcon
} from '@heroicons/react/20/solid';
import { InputCheck } from '~components/form';

type Props = {
  accounts: Array<{
    accountId: number;
    name: string;
    type: string;
    denomination: string;
    precision: number;
    balance: number;
    flow: number;
  }>;
  onViewTransactions?: (accountId: number) => void;
  onEditAccount?: (accountId: number) => void;
};

const getNumType = (v: number): 'neutral' | 'positive' | 'negative' =>
  v === 0 || isNaN(v)
    ? ('neutral' as const)
    : v > 0
    ? ('positive' as const)
    : ('negative' as const);

const getWhole = (v: number) => Math.floor(Math.abs(v));
const getDecimals = (v: number, precision: number) =>
  (Math.abs(v) - getWhole(v)).toFixed(precision).substring(1);

export default function AccountList({ accounts, onViewTransactions, onEditAccount }: Props) {
  const transformedAccounts = accounts.map((a) => ({
    ...a,
    balanceFraction: getDecimals(a.balance, a.precision),
    balanceWhole: getWhole(a.balance),
    flowFraction: getDecimals(a.flow, a.precision),
    flowWhole: getWhole(a.flow),
    flowType: getNumType(a.flow),
    balanceType: getNumType(a.balance)
  }));
  return (
    <>
      <table className="relative min-w-full table-fixed divide-y divide-stone-200 dark:divide-stone-600">
        <thead className="sticky top-0 bg-stone-100 uppercase dark:bg-stone-700">
          <tr>
            {/* <th scope="col" className="p-4">
              <div className="flex items-center">
                <InputCheck />
              </div>
            </th> */}
            <th
              scope="col"
              className="p-4 text-left text-xs font-medium uppercase text-stone-500 dark:text-stone-400"
            >
              Name
            </th>
            <th
              scope="col"
              colSpan={2}
              className="whitespace-nowrap p-4 text-left text-xs font-medium uppercase text-stone-500 dark:text-stone-400"
            >
              Cash Flow
            </th>
            <th
              scope="col"
              colSpan={2}
              className="whitespace-nowrap p-4 text-left text-xs font-medium uppercase text-stone-500 dark:text-stone-400"
            >
              Balance
            </th>
            <th
              scope="col"
              className="whitespace-nowrap p-4 text-left text-xs font-medium uppercase text-stone-500 dark:text-stone-400"
            >
              Currency
            </th>
            <th
              scope="col"
              className="p-4 text-left text-xs font-medium uppercase text-stone-500 dark:text-stone-400"
            ></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-stone-200 bg-white dark:divide-stone-700 dark:bg-stone-800">
          {transformedAccounts.map((account) => (
            <tr key={account.accountId} className="hover:bg-stone-100 dark:hover:bg-stone-700">
              {/* <td className="w-4 p-4 ">
                <div className="flex items-center">
                  <InputCheck />
                </div>
              </td> */}
              <td
                className="w-full cursor-pointer whitespace-nowrap p-4 text-sm font-normal text-stone-500 dark:text-stone-400"
                onClick={() => onViewTransactions?.(account.accountId)}
              >
                <div className="text-base font-semibold text-stone-900 dark:text-white">
                  {account.name}
                </div>
                <div className="text-sm font-normal text-stone-500 dark:text-stone-400">
                  {account.type}
                </div>
              </td>
              {/* TODO: color should be graduated (reddest for the most negative flow, greenest for most positive flow) */}
              <td
                className="whitespace-nowrap p-4 pr-0 text-right font-medium text-stone-500 data-[flow=positive]:text-green-500 data-[flow=negative]:text-red-500 "
                data-flow={account.flowType}
              >
                <div className="flex items-center justify-end">
                  {account.flowType === 'positive' && <ArrowSmallUpIcon className="h-4 w-4" />}
                  {account.flowType === 'negative' && <ArrowSmallDownIcon className="h-4 w-4" />}

                  <span className="font-mono">{account.flowWhole.toLocaleString()}</span>
                </div>
              </td>
              <td className="whitespace-nowrap p-4 pl-0  text-left font-mono text-sm font-light text-stone-500">
                {account.flowFraction}
              </td>
              <td className="whitespace-nowrap p-4 pr-0 text-right font-mono font-medium text-stone-900 dark:text-white">
                <div className="flex items-center justify-end gap-x-1">
                  {account.balanceType === 'positive' && (
                    <PlusIcon className="h-4 w-4 text-green-500" />
                  )}
                  {account.balanceType === 'negative' && (
                    <MinusIcon className="h-4 w-4 text-red-500" />
                  )}
                  {account.balanceWhole.toLocaleString()}
                </div>
              </td>
              <td className="whitespace-nowrap p-4 pl-0  text-left font-mono text-sm font-light text-stone-900 dark:text-white">
                {account.balanceFraction}
              </td>
              <td className="whitespace-nowrap p-4 text-left text-xs font-light text-stone-900 dark:text-white">
                {account.denomination}
              </td>
              <td className="p-4 text-right">
                <AccountMenu
                  onTransactions={() => onViewTransactions?.(account.accountId)}
                  onRename={() => onEditAccount?.(account.accountId)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
