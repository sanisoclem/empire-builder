import { atom, useAtom } from 'jotai';

type AccountModalState = {
  open: boolean;
  editing: unknown;
};
export const accountModalAtom = atom<AccountModalState>({
  open: false,
  editing: null
});

export const useModal = () => {
  const [, setAccountModalState] = useAtom(accountModalAtom);

  return {
    newAccount: () => setAccountModalState((s) => ({ ...s, open: true }))
  };
};
