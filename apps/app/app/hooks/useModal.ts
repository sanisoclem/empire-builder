import { atom, useAtom } from 'jotai';

type Currency = { id: string; name: string; precision: number };
type AccountModalState = {
  open: boolean;
  title: string;
  workspaceId: string;
  editing: unknown;
  currencies: Currency[];
};
export const accountModalAtom = atom<AccountModalState>({
  workspaceId: '',
  title: '',
  open: false,
  editing: null,
  currencies: []
});

export const useModal = () => {
  const [, setAccountModalState] = useAtom(accountModalAtom);

  return {
    newAccount: (currencies: Currency[], workspaceId: string) =>
      setAccountModalState((s) => ({
        ...s,
        open: true,
        title: 'New Account',
        workspaceId,
        currencies
      }))
  };
};
