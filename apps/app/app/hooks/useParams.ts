import type { Params } from '@remix-run/react';
import { useParams } from '@remix-run/react';

export const useParamWorkspaceId = (): Readonly<Params<string>> & { workspaceId: string } => {
  const { workspaceId, ...others } = useParams();
  if (workspaceId === undefined) throw new Error('Cannot find workspaceId parameter');
  return { workspaceId, ...others };
};

export const useParamAccountId = (): Readonly<Params<string>> & {
  accountId: string;
  workspaceId: string;
} => {
  const { accountId, workspaceId, ...others } = useParamWorkspaceId();
  if (accountId === undefined) throw new Error('Cannot find accountId parameter');
  return { accountId, workspaceId, ...others };
};
