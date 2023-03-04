import { atom, useAtom } from 'jotai';

type Currency = { id: string; name: string; precision: number };
type AccountModalState = {
  workspaceId: string;
  open: boolean;
  editing: unknown;
  currencies: Currency[];
};
export const accountModalAtom = atom<AccountModalState>({
  workspaceId: '',
  open: false,
  editing: null,
  currencies: []
});

export const useModal = () => {
  const [, setAccountModalState] = useAtom(accountModalAtom);

  return {
    newAccount: (currencies: Currency[], workspaceId: string) =>
      setAccountModalState((s) => ({ ...s, open: true, workspaceId, currencies }))
  };
};
