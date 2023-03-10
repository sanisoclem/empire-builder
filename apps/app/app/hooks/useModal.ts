import { atom, useAtom } from 'jotai';
import { accountModalAtom, AccountModalState, Currency } from '~components/modal/account';
import { bucketModalAtom, BucketModalState } from '~components/modal/bucket';

export const useModal = () => {
  const [, setAccountModalState] = useAtom(accountModalAtom);
  const [, setBucketModalState] = useAtom(bucketModalAtom);

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
      }))
  };
};
