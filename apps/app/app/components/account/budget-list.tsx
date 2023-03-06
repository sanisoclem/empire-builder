import { useFetcher } from '@remix-run/react';
import type { Identifier, XYCoord } from 'dnd-core';
import { useCallback, useRef, useState } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { ROUTES } from '~/routes';

type Props = {
  workspaceId: string;
  currency: string;
  precision: number;
  buckets: Array<{
    bucketId: number;
    name: string;
    spent: number;
    budgeted: number;
    index: number;
    category: string;
  }>;
};
interface DragItem {
  index: number;
  id: string;
  type: string;
}
type BudgetListItemProps = {
  bucketId: number;
  name: string;
  spent: number;
  budgeted: number;
  index: number;
  moveCard: (dragIndex: number, hoverIndex: number) => void;
};
const BudgetListItem = ({
  bucketId,
  name,
  index,
  spent,
  budgeted,
  moveCard
}: BudgetListItemProps) => {
  const ref = useRef<HTMLTableRowElement>(null);
  const [{ handlerId }, drop] = useDrop<DragItem, void, { handlerId: Identifier | null }>({
    accept: 'bucket',
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId()
      };
    },
    hover(item: DragItem, monitor) {
      if (!ref.current) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = index;

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
  const [{ isDragging }, drag] = useDrag({
    type: 'bucket',
    item: () => {
      return { id: bucketId, index };
    },
    collect: (monitor: any) => ({
      isDragging: monitor.isDragging()
    })
  });

  drag(drop(ref));
  return (
    <tr
      ref={ref}
      className="hover:bg-stone-100 data-[drag-state=dragging]:opacity-0 dark:hover:bg-stone-700"
      data-handler-id={handlerId}
      data-drag-state={isDragging ? 'dragging' : ''}
    >
      <td
        className="w-full cursor-pointer whitespace-nowrap px-4 py-2 text-sm font-normal text-stone-500 dark:text-stone-400"
        onClick={() => {}}
      >
        {name}
      </td>
      <td className="whitespace-nowrap px-4 py-2 font-mono text-sm font-light text-stone-500">
        {spent}
      </td>
      <td className="whitespace-nowrap px-4 py-2 font-mono text-sm font-light text-stone-500">
        {budgeted}
      </td>
    </tr>
  );
};

function splice<T>(arr: T[], start: number, deleteCount: number, ...addItem: T[]) {
  const result: T[] = [];
  if (start > 0) {
    result.push(...arr.slice(0, start));
  }
  result.push(...addItem);
  const len = result.length - addItem.length;
  let count = deleteCount <= 0 ? len : len + deleteCount;
  if (arr[count]) {
    result.push(...arr.slice(count));
  }
  return result;
}

export default function BudgetList({ workspaceId, currency, precision, buckets }: Props) {
  const fetcher = useFetcher();
  const sortedBuckets = buckets
    .sort((a, b) => (a.index < b.index ? -1 : 1))
    .map(({ index, ...b }) => b);
  const [bucketCategories, setBucketCategories] = useState(
    [...new Set(sortedBuckets.map((b) => b.category))]
      .map((c) => ({
        category: c,
        buckets: sortedBuckets.filter((b) => b.category === c)
      }))
      .map((c) => ({
        ...c,
        spent: c.buckets.reduce((acc, b) => acc + b.spent, 0),
        budgeted: c.buckets.reduce((acc, b) => acc + b.budgeted, 0)
      }))
  );
  const moveCard = useCallback((dragIndex: number, hoverIndex: number) => {
    setBucketCategories((s) => {
      const [src, srcCat, srcIdx] = s
        .flatMap((s, i1) => s.buckets.map((b, i2) => [b, s, i1 * 10000 + i2] as const))
        .find(([b, s, i]) => i === dragIndex)!;
      const [target, targetCat, targetIdx] = s
        .flatMap((s, i1) => s.buckets.map((b, i2) => [b, s, i1 * 10000 + i2] as const))
        .find(([b, s, i]) => i === hoverIndex)!;
      console.log(dragIndex, src.name, hoverIndex, target.name);

      const retval = s.map((cat) => {
        if (cat === srcCat && cat === targetCat) {
          return {
            ...cat,
            buckets: splice(splice(cat.buckets, srcIdx % 10000, 1), targetIdx % 10000, 0, src)
          };
        }
        if (cat === srcCat) {
          return {
            ...cat,
            buckets: splice(cat.buckets, srcIdx % 10000, 1)
          };
        }
        if (cat === targetCat) {
          return {
            ...cat,
            buckets: splice(cat.buckets, targetIdx % 10000, 0, src)
          };
        }
        return cat;
      });

      fetcher.submit({
        request: JSON.stringify(
          retval
            .flatMap((s, i1) => s.buckets.map((b, i2) => [b, s, i1 * 10000 + i2] as const))
            .map(([b, s, i]) => ({
              bucketId: b.bucketId,
              category: s.category,
              order: i
            }))
        )
      },
      {
        method:'post',
        action: ROUTES.workspace(workspaceId).bucket.organize
      });

      return retval;
    });
  }, []);

  return (
    <>
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
          {bucketCategories.map((cat, i1) => (
            <tbody
              key={cat.category}
              className="divide-y divide-stone-200 bg-white dark:divide-stone-700 dark:bg-stone-800"
            >
              <tr className="bg-stone-100/50 hover:bg-stone-100 dark:bg-stone-900/40 dark:hover:bg-stone-700">
                <td className="w-full whitespace-nowrap px-4 py-2  text-base font-semibold text-stone-500 dark:text-stone-200">
                  {cat.category}
                </td>
                <td className="whitespace-nowrap px-4 py-2 font-mono text-base font-semibold text-stone-500">
                  {cat.spent}
                </td>
                <td className="whitespace-nowrap px-4 py-2 font-mono text-base font-semibold text-stone-500">
                  {cat.budgeted}
                </td>
              </tr>
              {cat.buckets.map((item, i2) => (
                <BudgetListItem
                  key={item.bucketId}
                  index={i1 * 10000 + i2}
                  {...item}
                  moveCard={moveCard}
                />
              ))}
            </tbody>
          ))}
        </table>
      </DndProvider>
    </>
  );
}
