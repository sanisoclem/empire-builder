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
    accountId: string;
    name: string;
    type: string;
    denomination: string;
    balance: number;
    flow: number;
  }>;
  onViewTransactions?: (accountId: string) => void;
  onEditAccount?: (accountId: string) => void;
};

export default function AccountList({ accounts, onViewTransactions, onEditAccount }: Props) {
  const transformedAccounts = accounts.map((a) => ({
    ...a,
    flowType:
      a.flow === 0
        ? ('neutral' as const)
        : a.flow > 0
        ? ('positive' as const)
        : ('negative' as const),
    balanceType:
      a.balance === 0
        ? ('neutral' as const)
        : a.balance > 0
        ? ('positive' as const)
        : ('negative' as const)
  }));
  return (
    <>
      <table className="min-w-full divide-y divide-stone-200 table-fixed dark:divide-stone-600">
        <thead className="bg-stone-100 dark:bg-stone-700 uppercase">
          <tr>
            <th scope="col" className="p-4">
              <div className="flex items-center">
                <InputCheck />
              </div>
            </th>
            <th
              scope="col"
              className="p-4 text-xs font-medium text-left text-stone-500 uppercase dark:text-stone-400"
            >
              Name
            </th>
            <th
              scope="col"
              className="p-4 text-xs whitespace-nowrap font-medium text-right text-stone-500 uppercase dark:text-stone-400"
            >
              Cash Flow
            </th>
            <th
              scope="col"
              colSpan={3}
              className="p-4 text-xs font-medium whitespace-nowrap text-stone-500 uppercase dark:text-stone-400 text-right"
            >
              Balance
            </th>
            <th
              scope="col"
              className="p-4 text-xs font-medium text-left text-stone-500 uppercase dark:text-stone-400"
            ></th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-stone-200 dark:bg-stone-800 dark:divide-stone-700">
          {transformedAccounts.map((account) => (
            <tr key={account.accountId} className="hover:bg-stone-100 dark:hover:bg-stone-700">
              <td className="w-4 p-4 ">
                <div className="flex items-center">
                  <InputCheck />
                </div>
              </td>
              <td
                className="p-4 w-full text-sm font-normal text-stone-500 whitespace-nowrap dark:text-stone-400"
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
                data-flow={account.flowType}
                className="p-4 text-base font-medium text-stone-500 whitespace-nowrap text-right data-[flow=positive]:text-green-500 data-[flow=negative]:text-red-500"
              >
                <div className="flex justify-end items-center">
                  {account.flowType === 'positive' && <ArrowSmallUpIcon className="h-4 w-4" />}
                  {account.flowType === 'negative' && <ArrowSmallDownIcon className="h-4 w-4" />}

                  {Math.abs(account.flow).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </div>
              </td>
              <td className="p-4 pr-0 pl-6 text-base font-medium text-stone-900 whitespace-nowrap dark:text-white text-right">
                {account.balanceType === 'positive' && (
                  <PlusIcon className="text-green-500 h-4 w-4" />
                )}
                {account.balanceType === 'negative' && (
                  <MinusIcon className="h-4 w-4 text-red-500" />
                )}
              </td>
              <td className="p-4 px-1 text-base font-medium text-stone-900 whitespace-nowrap dark:text-white text-right">
                {Math.abs(account.balance).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </td>
              <td className="p-4 pl-1 text-sm  text-stone-900 whitespace-nowrap font-light dark:text-white text-left">
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
