import type { Params } from '@remix-run/react';
import { useParams } from '@remix-run/react';

export const useParamLedgerId = (): Readonly<Params<string>> & { ledgerId: string } => {
  const { ledgerId, ...others } = useParams();
  if (ledgerId === undefined) throw new Error('Cannot find ledgerId parameter');
  return { ledgerId, ...others };
};

export const useParamAccountId = (): Readonly<Params<string>> & {
  accountId: string;
  ledgerId: string;
} => {
  const { accountId, ledgerId, ...others } = useParamLedgerId();
  if (accountId === undefined) throw new Error('Cannot find accountId parameter');
  return { accountId, ledgerId, ...others };
};
