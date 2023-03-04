import { atom, useAtom } from 'jotai';


type Currency = {id: string; name: string; precision: number};
type AccountModalState = {
  open: boolean;
  editing: unknown;
  currencies: Currency[];
};
export const accountModalAtom = atom<AccountModalState>({
  open: false,
  editing: null,
  currencies: []
});

export const useModal = () => {
  const [, setAccountModalState] = useAtom(accountModalAtom);

  return {
    newAccount: (currencies: Currency[]) => setAccountModalState((s) => ({ ...s, open: true, currencies }))
  };
};
