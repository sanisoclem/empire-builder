import { zodResolver } from '@hookform/resolvers/zod';
import { Fragment, useEffect } from 'react';
import {
  Controller,
  FormProvider,
  useFieldArray,
  useForm,
  useFormContext,
  useWatch
} from 'react-hook-form';
import { z } from 'zod';
import { Button, InputCategoryCombo } from '~components';
import Input from '~components/form/input';
import Textarea from '~components/form/textarea';

type Txn = {
  txnId: number;
  date: Date;
  notes: string | null;
  data: NonEmptyArray<
    | {
        type: 'draft';
        amount: number;
      }
    | {
        type: 'transfer';
        otherAccountId: number;
        otherAmount: number | null;
        amount: number;
      }
    | {
        type: 'external';
        bucketId: number;
        amount: number;
        payee: string;
      }
  >;
};

type TxnRowProps = {
  accounts: Array<{
    id: number;
    name: string;
    currency: string;
  }>;
  buckets: Array<{
    id: number;
    name: string;
    category: string | null;
  }>;
  txn: Txn;
  onClick?: (v: Txn) => void;
};

export default function TxnRow({ accounts, buckets, txn, onClick }: TxnRowProps) {
  return (
    <tbody className="group" onClick={() => onClick?.(txn)}>
      {txn.data.map((d, i) => (
        <tr
          key={i}
          className="h-1 bg-white group-hover:bg-stone-100 dark:divide-stone-700 dark:bg-stone-800 dark:group-hover:bg-stone-700"
        >
          {i === 0 && (
            <td
              rowSpan={txn.data.length}
              className="h-full cursor-pointer whitespace-nowrap px-1 py-2 text-sm font-normal text-stone-500 dark:text-stone-400"
            >
              <div className="flex h-full flex-col items-stretch">
                {txn.date.toLocaleDateString()}
              </div>
            </td>
          )}
          <td className="whitespace-nowrap px-1 py-2 font-medium text-stone-500">
            {d.type === 'draft'
              ? ''
              : d.type === 'transfer'
              ? d.amount > 0
                ? `Transfer from: ${accounts.find((a) => a.id === d.otherAccountId)!.name}`
                : `Transfer to: ${accounts.find((a) => a.id === d.otherAccountId)!.name}`
              : `${buckets.find((a) => a.id === d.bucketId)!.category}: ${
                  buckets.find((a) => a.id === d.bucketId)!.name
                }`}
          </td>
          <td className="whitespace-nowrap px-1 py-2 font-medium text-stone-500">
            {'payee' in d && d.payee}
          </td>
          {i === 0 && (
            <td rowSpan={txn.data.length} className="h-full px-1 py-2 font-medium text-stone-500">
              {txn.notes}
            </td>
          )}
          <td className="whitespace-nowrap px-1 py-2 font-medium text-stone-500">
            {d.type === 'transfer' &&
              d.amount !== d.otherAccountId &&
              (d.otherAccountId / Math.pow(10, 2)).toFixed(2)}
          </td>
          <td className="whitespace-nowrap px-1 py-2 font-medium text-stone-500">
            {(d.amount / Math.pow(10, 2)).toFixed(2)}
          </td>
          {i === 0 && (
            <td className="h-full whitespace-nowrap px-1 py-2 text-right font-medium text-stone-500">
              <div className="flex h-full flex-col items-stretch">0.00</div>
            </td>
          )}
        </tr>
      ))}
    </tbody>
  );
}
