import { XMarkIcon } from '@heroicons/react/20/solid';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useFieldArray, useForm, useFormContext, useWatch } from 'react-hook-form';
import { z } from 'zod';
import { Button, InputCategoryCombo } from '~components';
import Input from '~components/form/input';
import Textarea from '~components/form/textarea';
import { formSchema, Txn } from './txn-form-schema';
import { NumericFormat } from 'react-number-format';
import Decimal from 'decimal.js';
import { mapNonEmpty } from '~api/array';
import { useCallback, useEffect } from 'react';

type TxEditProps = {
  currency: string;
  precision: number;
  isLoading: boolean;
  categories: Array<
    | {
        id: string;
        name: string;
        type: 'account';
        accountId: number;
        currency: string;
        precision: number;
        category: string;
      }
    | {
        type: 'bucket';
        id: string;
        bucketId: number;
        category: string;
        name: string;
      }
  >;
  txn?: Txn;
  onSubmit?: (v: z.infer<typeof formSchema>) => void;
  onDelete?: (txnId: number) => void;
  onCancel?: () => void;
};
const toQuantized = (v: string | number, precision: number) => {
  try {
    return new Decimal(v).mul(new Decimal(10).pow(new Decimal(precision))).toNumber();
  } catch {
    return NaN;
  }
};

const fromQuantized = (v: number, precision: number) => {
  try {
    return new Decimal(v).div(new Decimal(10).pow(new Decimal(precision))).toString() as any;
  } catch {
    return NaN;
  }
};

export default function TxnEdit({
  txn,
  categories,
  onCancel,
  currency,
  onSubmit,
  onDelete,
  precision,
  isLoading
}: TxEditProps) {
  const defaultValues =
    txn === undefined
      ? { data: [{}] }
      : {
          date: txn.date.toISOString().split('T')[0] as any,
          notes: txn.notes ?? '',
          data: txn.data
            .map((d) =>
              d.type === 'draft'
                ? { category: null, amount: d.amount }
                : d.type === 'external'
                ? {
                    category: categories.find(
                      (c) => c.type === 'bucket' && c.bucketId === d.bucketId
                    )!,
                    amount: d.amount,
                    payee: d.payee
                  }
                : {
                    category: categories.find(
                      (c) => c.type === 'account' && c.accountId === d.otherAccountId
                    )!,
                    amount: d.amount,
                    otherAmount: d.otherAmount
                  }
            )
            .map((d) => ({
              ...d,
              amount: fromQuantized(d.amount, precision),
              otherAmount:
                d.otherAmount !== undefined && d.otherAmount !== null && 'precision' in d.category
                  ? fromQuantized(d.otherAmount, d.category.precision)
                  : undefined
            }))
        };
  const { control, register, handleSubmit } = useForm<z.infer<typeof formSchema>>({
    defaultValues,
    resolver: zodResolver(formSchema)
  });
  const { fields, append, remove } = useFieldArray({ control, name: 'data' });
  const data = useWatch({ control, name: 'data' });

  const handlEsc = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      onCancel?.();
    }
  }, []);

  useEffect(() => {
    document.addEventListener('keydown', handlEsc);

    return () => document.removeEventListener('keydown', handlEsc);
  }, [handlEsc]);

  const handleSave = (v: z.infer<typeof formSchema>) => {
    onSubmit?.({
      ...v,
      data: mapNonEmpty(v.data, (d) => ({
        ...d,
        amount: toQuantized(d.amount, precision),
        ...(d.category?.type === 'account' &&
        'otherAmount' in d &&
        d.otherAmount !== undefined &&
        d.otherAmount !== null
          ? { otherAmount: toQuantized(d.otherAmount, d.category.precision) }
          : {})
      }))
    });
  };

  return (
    <tbody className="group">
      {fields.map((f, i) => (
        <tr
          key={f.id}
          className="h-1 bg-white group-hover:bg-stone-100 dark:divide-stone-700 dark:bg-stone-800 dark:group-hover:bg-stone-700"
        >
          <td className="h-full cursor-pointer whitespace-nowrap px-1 py-2 text-right text-sm font-normal text-stone-500 dark:text-stone-400">
            {i === 0 && (
              <div className="flex h-full flex-col items-stretch">
                <Input type="date" variant="sm" {...register('date')} />
              </div>
            )}
            {i > 0 && (
              <Button
                type="button"
                className="rounded-full !p-0 text-center opacity-50 hover:opacity-100"
                variant="danger"
                disabled={isLoading}
                onClick={() => remove(i)}
              >
                <XMarkIcon className="h-auto w-5" />
              </Button>
            )}
          </td>
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
            {data[i]?.category?.type === 'bucket' && (
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
              const d = data[i];
              if (!d || d.category?.type !== 'account') return;
              const otherCurrency = d.category.currency;
              const otherPrecision = d.category.precision;
              return (
                otherCurrency !== currency && (
                  <Controller
                    render={({ field: { ref, ...field } }) => (
                      <NumericFormat
                        decimalScale={otherPrecision}
                        fixedDecimalScale={true}
                        customInput={Input}
                        variant="sm"
                        type="text"
                        defaultValue={0}
                        placeholder="amount"
                        {...field}
                      />
                    )}
                    name={`data.${i}.otherAmount`}
                    control={control}
                  />
                )
              );
            })()}
          </td>
          <td className="whitespace-nowrap px-1 py-2 font-medium text-stone-500">
            <Controller
              render={({ field: { ref, ...field } }) => (
                <NumericFormat
                  decimalScale={precision}
                  fixedDecimalScale={true}
                  customInput={Input}
                  variant="sm"
                  type="text"
                  placeholder="amount"
                  defaultValue={0}
                  {...field}
                />
              )}
              name={`data.${i}.amount`}
              control={control}
            />
          </td>
          <td></td>
        </tr>
      ))}
      <tr>
        <td colSpan={7} className="p-2">
          <div className="flex justify-center gap-x-2">
            {txn?.txnId !== undefined && <Button
              type="button"
              className="w-28 !p-1 text-center"
              variant="danger"
              disabled={isLoading}
              onClick={() => onDelete?.(txn.txnId)}
            >
              Delete
            </Button>}
            <Button
              type="button"
              className="w-28 !p-1 text-center"
              variant="neutral"
              disabled={isLoading}
              onClick={() => append({ amount: 0 })}
            >
              Add Split
            </Button>
            <Button
              type="button"
              className="w-28 !p-1 text-center"
              variant="neutral"
              disabled={isLoading}
              onClick={onCancel}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={isLoading}
              onClick={handleSubmit(handleSave, console.log)}
              className="w-28 !p-1 text-center"
            >
              Save
            </Button>
          </div>
        </td>
      </tr>
    </tbody>
  );
}
