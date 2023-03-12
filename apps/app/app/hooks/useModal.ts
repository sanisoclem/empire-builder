import { atom, useAtom } from 'jotai';
import { accountModalAtom, AccountModalState, Currency } from '~components/modal/account';
import { bucketModalAtom, BucketModalState } from '~components/modal/bucket';
import { txnImportModalAtom } from '~components/modal/txn-import';

export const useModal = () => {
  const [, setAccountModalState] = useAtom(accountModalAtom);
  const [, setBucketModalState] = useAtom(bucketModalAtom);
  const [, setTxnImportModalState] = useAtom(txnImportModalAtom);

  return {
    newAccount: (currencies: Currency[], workspaceId: string) =>
      setAccountModalState((s) => ({
        ...s,
        open: true,
        editing: null,
        title: 'New Account',
        workspaceId,
        currencies
      })),
    editAccount: (account: NonNullable<AccountModalState['editing']>, workspaceId: string) =>
      setAccountModalState((s) => ({
        ...s,
        open: true,
        workspaceId,
        editing: account,
        title: 'Edit Account'
      })),
    newBucket: (workspaceId: string) =>
      setBucketModalState((s) => ({
        ...s,
        open: true,
        editing: null,
        title: 'New income or expense bucket',
        workspaceId
      })),
    editBucket: (bucket: NonNullable<BucketModalState['editing']>, workspaceId: string) =>
      setBucketModalState((s) => ({
        ...s,
        open: true,
        workspaceId,
        editing: bucket,
        title: 'Edit income or expense bucket'
      })),
    importTransactions: (workspaceId: string, accountId: number, precision: number) =>
      setTxnImportModalState((s) =>
        s.isLoading
          ? s
          : {
              ...s,
              open: true,
              workspaceId,
              precision,
              accountId
            }
      )
  };
};
