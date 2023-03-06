type Props = {
  currency: string;
  precision: number;
  buckets: Record<
    string,
    Array<{
      bucketId: number;
      name: string;
      spent: number;
      budgeted: number;
    }>
  >;
};
type BudgetItem =
  | ({
      type: 'item';
      category: string;
    } & Props['buckets'][string][number])
  | {
      type: 'category';
      name: string;
      spent: number;
      budgeted: number;
    };

export default function BudgetList({ currency, precision, buckets }: Props) {
  const transformedBuckets = Object.entries(buckets).reduce(
    (acc, [category, bs]) => [
      ...acc,
      {
        type: 'category' as const,
        name: category,
        spent: bs.reduce((acc, b) => acc + b.spent, 0),
        budgeted: bs.reduce((acc, b) => acc + b.budgeted, 0)
      },
      ...bs.map((b) => ({ type: 'item' as const, category, ...b }))
    ],
    [] as BudgetItem[]
  );
  return (
    <>
      <table className="relative min-w-full table-fixed divide-y divide-stone-200 dark:divide-stone-600">
        <thead className="sticky top-0 bg-stone-100 uppercase dark:bg-stone-700">
          <tr>
            <th
              scope="col"
              className="px-4 py-2 text-left text-xs font-medium uppercase text-stone-500 dark:text-stone-400"
            >
              Name
            </th>
            <th
              scope="col"
              className="whitespace-nowrap px-4 py-2 text-left text-xs font-medium uppercase text-stone-500 dark:text-stone-400"
            >
              Spent
            </th>
            <th
              scope="col"
              className="whitespace-nowrap px-4 py-2 text-left text-xs font-medium uppercase text-stone-500 dark:text-stone-400"
            >
              Budgeted
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-stone-200 bg-white dark:divide-stone-700 dark:bg-stone-800">
          {transformedBuckets.map((item) => (
            <>
              {item.type === 'category' && (
                <tr key={item.name} className="dark:bg-stone-900/40 hover:bg-stone-100 dark:hover:bg-stone-700">
                  <td className="w-full whitespace-nowrap px-4 py-2  font-semibold text-base text-stone-500 dark:text-stone-200">
                    {item.name}
                  </td>
                  <td className="whitespace-nowrap px-4 py-2 font-mono font-semibold text-base text-stone-500">
                    0
                  </td>
                  <td className="whitespace-nowrap px-4 py-2 font-mono font-semibold text-base text-stone-500">
                    0
                  </td>
                </tr>
              )}
              {item.type === 'item' && (
                <tr key={item.bucketId} className="hover:bg-stone-100 dark:hover:bg-stone-700">
                  <td
                    className="w-full cursor-pointer whitespace-nowrap px-4 py-2 text-sm font-normal text-stone-500 dark:text-stone-400"
                    onClick={() => {}}
                  >
                    {item.name}
                  </td>
                  <td className="whitespace-nowrap px-4 py-2 font-mono text-sm font-light text-stone-500">
                    {item.spent}
                  </td>
                  <td className="whitespace-nowrap px-4 py-2 font-mono text-sm font-light text-stone-500">
                    {item.budgeted}
                  </td>
                </tr>
              )}
            </>
          ))}
        </tbody>
      </table>
    </>
  );
}
