import { LoaderFunction, redirect } from '@remix-run/server-runtime';
import { ROUTES } from '~/routes';
import { requireOnboarded } from '~api/auth';
import { WorkspaceClient } from '~api/workspace/api';

export const loader: LoaderFunction = async (args) => {
  const { customClaims } = await requireOnboarded(args);
  const wsClient = new WorkspaceClient(args);

  const workspaces = await wsClient.getAllWorkspaces();
  const joined = workspaces.filter(w=> customClaims.workspaces.includes(w.id));

  if (joined.length === 0) throw redirect(ROUTES.createWorkspace);

  return redirect(ROUTES.workspace(joined[0]!.id).dashboard);
};

export default function () {
  return <div>Redirecting...</div>;
}
