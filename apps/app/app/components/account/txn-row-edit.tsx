import {
  Controller,
  useFieldArray,
  useFormContext,
  useWatch
} from 'react-hook-form';
import { z } from 'zod';
import { Button, InputCategoryCombo } from '~components';
import Input from '~components/form/input';
import Textarea from '~components/form/textarea';
import { formSchema } from './txn-form-schema';


type TxEditProps = {
  currency: string;
  categories: Array<{ id: string; name: string; category: string }>;
  onCancel?: () => void;
};

export default function TxnEdit({ categories, onCancel, currency }: TxEditProps) {
  const { control, register } = useFormContext<z.infer<typeof formSchema>>();
  const { fields } = useFieldArray({ control, name: 'data' });
  const data = useWatch({ control, name: 'data' });

  return (
    <tbody className="group">
      {fields.map((f, i) => (
        <tr
          key={i}
          className="h-1 bg-white group-hover:bg-stone-100 dark:divide-stone-700 dark:bg-stone-800 dark:group-hover:bg-stone-700"
        >
          {i === 0 && (
            <td
              rowSpan={fields.length}
              className="h-full cursor-pointer whitespace-nowrap px-1 py-2 text-sm font-normal text-stone-500 dark:text-stone-400"
            >
              <div className="flex h-full flex-col items-stretch">
                <Input type="date" variant="sm" {...register('date', { valueAsDate: true })} />
              </div>
            </td>
          )}
          <td className="whitespace-nowrap px-1 py-2 font-medium text-stone-500">
            <Controller
              name={`data.${i}.category`}
              control={control}
              render={({ field }) => (
                <InputCategoryCombo
                  variant="sm"
                  {...field}
                  placeholder="choose a category"
                  choices={categories}
                />
              )}
            />
          </td>
          <td className="whitespace-nowrap px-1 py-2 font-medium text-stone-500">
            {data[i].category?.type === 'bucket' && (
              <Input
                placeholder="payee"
                variant="sm"
                type="text"
                {...register(`data.${i}.payee`)}
              />
            )}
          </td>
          {i === 0 && (
            <td rowSpan={fields.length} className="h-full px-1 py-2 font-medium text-stone-500">
              <div className="flex h-full flex-col items-stretch">
                <Textarea
                  noresize={true}
                  variant="sm"
                  rows={1}
                  placeholder="notes"
                  {...register('notes')}
                />
              </div>
            </td>
          )}
          <td className="whitespace-nowrap px-1 py-2 font-medium text-stone-500">
            {(() => {
              let d = data[i]!;
              return (
                d.category?.type === 'account' &&
                d.category.currency !== currency && (
                  <Input
                    variant="sm"
                    type="number"
                    placeholder="other amount"
                    {...register(`data.${i}.otherAmount`, { valueAsNumber: true })}
                  />
                )
              );
            })()}
          </td>
          <td className="whitespace-nowrap px-1 py-2 font-medium text-stone-500">
            <Input
              variant="sm"
              type="number"
              placeholder="amount"
              {...register(`data.${i}.amount`, { valueAsNumber: true })}
            />
          </td>
          <td></td>
        </tr>
      ))}
      <tr>
        <td colSpan={7} className="space-x-2 p-2 text-center">
          <Button
            type="button"
            className="w-28 !p-1 text-center"
            variant="neutral"
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button type="submit" className="w-28 !p-1 text-center">
            Save
          </Button>
        </td>
      </tr>
    </tbody>
  );
}

