import { LoaderFunction, redirect } from "@remix-run/server-runtime";
import { ROUTES } from "~/routes";
import { requireOnboarded } from "~api/auth";

export const loader: LoaderFunction = async (args) => {
  const { customClaims } = await requireOnboarded(args);

  if (customClaims.workspaces.length === 0)
    throw redirect(ROUTES.createWorkspace);

  return redirect(ROUTES.workspace(customClaims.workspaces[0]!).dashboard);
};
