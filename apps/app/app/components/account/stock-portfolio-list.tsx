import { Link } from '@remix-run/react';
import { ROUTES } from '~/routes';
import { useParamWorkspaceId } from '~hooks';

type Props = {
  portfolios: Array<{
    tradingAccountId: number;
    settlementAccountId: number;
    name: string;
    settlementAccountName: string;
    denomination: string;
    value: number;
    costBase: number;
  }>;
};

export default function StockPortfolioList({ portfolios }: Props) {
  const { workspaceId } = useParamWorkspaceId();
  return (
    <>
      <table className="relative min-w-full table-fixed divide-y divide-stone-200 dark:divide-stone-600">
        <thead className="sticky top-0 bg-stone-100 uppercase dark:bg-stone-700">
          <tr>
            <th
              scope="col"
              className="p-4 text-left text-xs font-medium uppercase text-stone-500 dark:text-stone-400"
            >
              Name
            </th>
            <th
              scope="col"
              className="whitespace-nowrap p-4 text-left text-xs font-medium uppercase text-stone-500 dark:text-stone-400"
            >
              Cost Base
            </th>
            <th
              scope="col"
              className="whitespace-nowrap p-4 text-left text-xs font-medium uppercase text-stone-500 dark:text-stone-400"
            >
              Value
            </th>
            <th
              scope="col"
              className="whitespace-nowrap p-4 text-left text-xs font-medium uppercase text-stone-500 dark:text-stone-400"
            >
              Currency
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-stone-200 bg-white dark:divide-stone-700 dark:bg-stone-800">
          {portfolios.map((p) => (
            <tr key={p.tradingAccountId} className="hover:bg-stone-100 dark:hover:bg-stone-700">
              <td
                className="w-full cursor-pointer whitespace-nowrap p-4 text-sm font-normal text-stone-500 dark:text-stone-400"
                onClick={() => {}}
              >
                <div className="text-base font-semibold text-stone-900 dark:text-white">
                  {p.name}
                </div>
                <div className="text-sm font-normal text-stone-500 dark:text-stone-400">
                  <Link
                    to={
                      ROUTES.workspace(workspaceId).account(p.settlementAccountId.toString())
                        .transactions
                    }
                  >
                    {p.settlementAccountName}
                  </Link>
                </div>
              </td>
              <td className="whitespace-nowrap p-4 text-left font-medium text-stone-500 data-[flow=positive]:text-green-500 data-[flow=negative]:text-red-500 ">
                {p.costBase.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </td>
              <td className="whitespace-nowrap p-4 text-left font-mono text-sm font-light text-stone-500">
                {p.value.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </td>

              <td className="p-4 text-right">{p.denomination}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
