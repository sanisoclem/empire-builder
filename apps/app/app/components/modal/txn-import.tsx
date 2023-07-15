import { useFetcher } from '@remix-run/react';
import { atom, useAtom } from 'jotai';
import { useEffect } from 'react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { ROUTES } from '~/routes';
import { Button, Input, InputCombo, Textarea } from '~components';
import { createModal } from './wrapper';
import { useDropzone } from 'react-dropzone';
import { parseQif } from '~api/qif';
import { submitJsonRequest } from '~api/formData';
import { postTxnsPayloadSchema } from '~/routes/ws.$workspaceId.a.$accountId.post-txns';
import Decimal from 'decimal.js';

export type TxnImportModalState = {
  open: boolean;
  title: string;
  workspaceId: string;
  precision: number;
  accountId: number;
  isLoading: boolean;
};
export const txnImportModalAtom = atom<TxnImportModalState>({
  open: false,
  title: '',
  precision: 0,
  workspaceId: '',
  accountId: 0,
  isLoading: false
});

export const toText = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsText(file);
    reader.onload = () => resolve(`T${reader.result}` as string);
    reader.onerror = (error) => reject(error);
  });

function TxnImportModal() {
  const [state, setState] = useAtom(txnImportModalAtom);
  const { getRootProps, getInputProps, acceptedFiles } = useDropzone({
    maxFiles: 1
  });
  const fetcher = useFetcher();
  const importFile = acceptedFiles.length > 0 ? acceptedFiles[0]! : null;

  function handleImport() {
    if (importFile === null) return;
    if (state.isLoading) return;

    const importInner = async () => {
      try {
        setState((s) => ({ ...s, isLoading: true }));
        const text = await toText(importFile);
        const qif = parseQif(text, { format: 'uk' });
        const data: z.infer<typeof postTxnsPayloadSchema> = qif.items.map((i) => ({
          date: i.date ?? new Date(),
          note: i.memo ?? i.reference ?? '',
          data: [
            {
              type: 'draft',
              payee: i.payee ?? '',
              amount: new Decimal(10)
                .pow(new Decimal(state.precision))
                .mul(new Decimal(i.amount ?? 0))
                .toNumber()
            }
          ],
          meta: {
            ...i.others.reduce((acc, v) => ({ ...acc, [v.type]: v.value }), {}),
            payee: i.payee?.toString(),
            memo: i.memo,
            reference: i.reference
          }
        }));
        submitJsonRequest(
          fetcher,
          ROUTES.workspace(state.workspaceId).account.item(state.accountId.toString())
            .postTransactions,
          postTxnsPayloadSchema,
          data
        );
      } catch (e) {
        console.error(e);
        setState((s) => ({ ...s, isLoading: false }));
      }
    };

    void importInner();
  }

  function handleCancel() {
    if (state.isLoading) return;
    setState((f) => ({ ...f, open: false }));
  }

  useEffect(() => {
    if (fetcher.type === 'done') {
      setState((f) => ({ ...f, open: false, isLoading: false }));
    }
  }, [fetcher.type]);

  return (
    <>
      <div
        {...getRootProps({
          className:
            'flex flex-col h-52 items-center justify-center borderborder-stone-500 bg-sky-50 p-6 text-center'
        })}
      >
        <input {...getInputProps()} />
        {importFile !== null && (
          <>
            <div>
              Importing <span className="font-mono">{importFile.name}</span>
            </div>
          </>
        )}
        {importFile === null && 'Choose or drop file here and click Import'}
      </div>
      <Button
        type="button"
        disabled={importFile === null}
        isLoading={state.isLoading}
        onClick={handleImport}
      >
        Import
      </Button>
    </>
  );
}

export default createModal(TxnImportModal, txnImportModalAtom, (s) => !s.isLoading);
