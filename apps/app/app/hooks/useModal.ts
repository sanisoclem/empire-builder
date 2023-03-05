import { atom, useAtom } from 'jotai';
import { accountModalAtom, AccountModalState, Currency } from '~components/modal/account';

export const useModal = () => {
  const [, setAccountModalState] = useAtom(accountModalAtom);

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
      editAccount: (account: NonNullable<AccountModalState["editing"]>,  workspaceId: string) =>
      setAccountModalState((s) => ({
        ...s,
        open: true,
        workspaceId,
        editing: account,
        title: 'Edit Account'
      }))
  };
};
