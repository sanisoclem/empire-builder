import { useFetcher } from '@remix-run/react';
import { organizeBudgetPayloadSchema } from '~/routes/ws.$workspaceId/b/organize';
import { submitJsonRequest } from '~api/formData';
import { useDebounce } from '~hooks';
import { ROUTES } from '~/routes';
import { useRef, useState } from 'react';
import { DndProvider, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Identifier, XYCoord } from 'dnd-core';

type Props = {
  workspaceId: string;
  currency: string;
  precision: number;
  categoryOrder: Record<string, number>;
  buckets: Array<{
    bucketId: number;
    name: string;
    spent: number;
    budgeted: number;
    index: number;
    category: string;
  }>;
};

type CategoryRow = {
  type: 'category';
  id: string;
  name: string;
  index: number;
  spent: number;
  budgeted: number;
};
type BucketRow = {
  bucketId: number;
  name: string;
  spent: number;
  budgeted: number;
  index: number;
  category: string;
  type: 'bucket';
  id: string;
};

type  BudgetItemRow = BucketRow | CategoryRow

type BudgeListtItemProps = {
  item: BucketRow | CategoryRow;
};

function BudgeListtItem({ item }: BudgeListtItemProps) {
  const ref = useRef<HTMLTableRowElement>(null);
  const [{ handlerId }, drop] = useDrop<BudgetItemRow, void, { handlerId: Identifier | null }>({
    accept: 'bucket',
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId()
      };
    },
    hover(otherItem: BudgetItemRow, monitor) {
      if (!ref.current) {
        return;
      }
      const dragIndex = otherItem.index;
      const hoverIndex = item.index;

      // Don't replace items with themselves
      if (dragIndex === hoverIndex) {
        return;
      }

      // Determine rectangle on screen
      const hoverBoundingRect = ref.current?.getBoundingClientRect();

      // Get vertical middle
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;

      // Determine mouse position
      const clientOffset = monitor.getClientOffset();

      // Get pixels to the top
      const hoverClientY = (clientOffset as XYCoord).y - hoverBoundingRect.top;

      // Only perform the move when the mouse has crossed half of the items height
      // When dragging downwards, only move when the cursor is below 50%
      // When dragging upwards, only move when the cursor is above 50%

      // Dragging downwards
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }

      // Dragging upwards
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }

      // Time to actually perform the action
      moveCard(dragIndex, hoverIndex);

      // Note: we're mutating the monitor item here!
      // Generally it's better to avoid mutations,
      // but it's good here for the sake of performance
      // to avoid expensive index searches.
      item.index = hoverIndex;
    }
  });
  return (
    <tr
    ref={ref}
      data-type={item.type}
      className="bg-stone-100/50 hover:bg-stone-100 dark:bg-stone-900/40 dark:hover:bg-stone-700"
    >
      <td className="w-full whitespace-nowrap px-4 py-2  text-base font-semibold text-stone-500 dark:text-stone-200">
        {item.name}
      </td>
      <td className="whitespace-nowrap px-4 py-2 font-mono text-base font-semibold text-stone-500">
        {item.spent}
      </td>
      <td className="whitespace-nowrap px-4 py-2 font-mono text-base font-semibold text-stone-500">
        {item.budgeted}
      </td>
    </tr>
  );
}

export default function BudgetListV2({
  workspaceId,
  categoryOrder,
  currency,
  precision,
  buckets
}: Props) {
  const fetcher = useFetcher();
  const { fn: organize, isDebouncing } = useDebounce(
    (arg) =>
      submitJsonRequest(
        fetcher,
        ROUTES.workspace(workspaceId).bucket.organize,
        organizeBudgetPayloadSchema,
        arg
      ),
    2000
  );

  const sortedBuckets = buckets
    .sort((a, b) => (a.index < b.index ? -1 : 1))
    .map(({ index, ...b }) => b);

  const [bucketCategories, setBucketCategories] = useState(
    [...new Set(buckets.map((b) => b.category))]
      .map((c) => ({
        id: `C_${c}`,
        type: 'category' as const,
        name: c,
        index: categoryOrder[c] ?? 0
      }))
      .sort((a, b) => (a.index < b.index ? -1 : 1))
      .reduce((acc, category) => {
        const filteredBuckets = buckets.filter((b) => b.category === category.name);
        return [
          ...acc,

          {
            ...category,
            spent: filteredBuckets.reduce((acc, b) => acc + b.spent, 0),
            budgeted: filteredBuckets.reduce((acc, b) => acc + b.budgeted, 0)
          },
          ...filteredBuckets
            .sort((a, b) => (a.index < b.index ? -1 : 1))
            .map((b) => ({ ...b, id: `B_${b.bucketId}`, type: 'bucket' as const }))
        ];
      }, [] as Array<BucketRow | CategoryRow>)
  );

  return (
    <DndProvider backend={HTML5Backend}>
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
        <tbody className="divide-y divide-stone-200 dark:divide-stone-700">
          {bucketCategories.map((r, i1) => (
            <BudgeListtItem key={r.id} item={r} />
          ))}
        </tbody>
      </table>
    </DndProvider>
  );
}
