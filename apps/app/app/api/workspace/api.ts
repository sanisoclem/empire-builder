import { AuthClient, requireOnboarded } from '~api/auth';
import { fromCompressedId, genCompressedId } from '~api/id';
import { DbClient } from 'db-totality';
import { DataFunctionArgs } from '@remix-run/server-runtime';

interface OnboardingRequest {
  userId: string;
  providerType: string;
  workspaceName: string;
}
interface OnboardingResult {
  userId: string;
  workspaceId: string;
}

export class WorkspaceClient {
  private dbClient: DbClient;
  private authClient: AuthClient;
  constructor(private args: DataFunctionArgs) {
    this.dbClient = new DbClient();
    this.authClient = new AuthClient(args);
  }

  async onboard(req: OnboardingRequest): Promise<OnboardingResult> {
    const userId = genCompressedId();
    const workspaceId = genCompressedId();
    const user = await this.authClient.getUser(req.userId);

    this.dbClient.exec((c) =>
      c.$transaction([
        c.user.create({
          data: {
            id: fromCompressedId(userId),
            provider_id: req.userId,
            provider_type: req.providerType,
            email: user.primaryEmailAddressId
              ? user.emailAddresses.find((e) => e.id === user.primaryEmailAddressId)!.emailAddress
              : 'loopback@empire-builder.online'
          }
        }),
        c.workspace.create({
          data: {
            id: fromCompressedId(workspaceId),
            name: req.workspaceName,
            owner: fromCompressedId(userId),
            created_at: new Date(),
            created_by: fromCompressedId(userId)
          }
        })
      ])
    );

    await this.authClient.updateUserPublicMetadata(req.userId, {
      appUserId: userId,
      workspaces: [workspaceId]
    });

    return {
      userId,
      workspaceId
    };
  }

  async createWorkspace(name: string) {
    const workspaceId = genCompressedId();
    const { customClaims, userId } = await requireOnboarded(this.args);

    this.dbClient.exec((c) =>
      c.workspace.create({
        data: {
          id: fromCompressedId(workspaceId),
          name: name,
          owner: fromCompressedId(customClaims.appUserId),
          created_at: new Date(),
          created_by: fromCompressedId(customClaims.appUserId)
        }
      })
    );

    await this.authClient.updateUserPublicMetadata(userId, {
      ...customClaims,
      workspaces: [...customClaims.workspaces, workspaceId]
    });

    return {
      workspaceId
    };
  }

  async getAllWorkspaces() {
    const { customClaims } = await requireOnboarded(this.args);

    return await this.dbClient.client.workspace.findMany({
      where: {
        id: {
          in: customClaims.workspaces.map(fromCompressedId)
        }
      }
    });
  }

  async getWorkspaceInfo(workspaceId: string) {
    const { customClaims } = await requireOnboarded(this.args);
    if (!customClaims.workspaces.includes(workspaceId))
      throw new Response('Unauthorized', { status: 403 });

    // TODO: return accounts, buckets etc
    return {};
  }

  async getCurrencies() {
    return await this.dbClient.client.currency.findMany();
  }

  async createAccount(
    workspaceId: string,
    name: string,
    accountType: string,
    currencyId: string,
    notes: string
  ) {
    const { customClaims } = await requireOnboarded(this.args);
    if (!customClaims.workspaces.includes(workspaceId))
      throw new Response('Unauthorized', { status: 403 });

    const { id } = await this.dbClient.exec((c) =>
      c.account.create({
        data: {
          name,
          currency_id: currencyId,
          workspace_id: fromCompressedId(workspaceId),
          type: accountType
        }
      })
    );

    return id;
  }

  async getAccountBalances(workspaceId: string) {
    const { customClaims } = await requireOnboarded(this.args);
    if (!customClaims.workspaces.includes(workspaceId))
      throw new Response('Unauthorized', { status: 403 });

    return await this.dbClient.client.account.findMany({
      where: {
        workspace_id: {
          equals: fromCompressedId(workspaceId)
        }
      }
    });
  }
}