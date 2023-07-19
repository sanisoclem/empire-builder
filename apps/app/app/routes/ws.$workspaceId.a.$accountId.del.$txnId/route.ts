import { LoaderFunction } from '@remix-run/server-runtime';
import { requireTxnId } from '~api/policy.server';
import { WorkspaceClient } from '~api/workspace/api';

export const action: LoaderFunction = async (args) => {
  const { workspaceId, accountId,  txnId } = requireTxnId(args.params);
  const wsClient = new WorkspaceClient(args);

  if (args.request.method !== 'DELETE') throw new Response(`Bad request, unsupported method: ${args.request.method}`, { status: 400 });

  await wsClient.deleteTransaction(workspaceId, accountId, txnId);

  return {};
};
