import { AuthClient, requireOnboarded } from "~api/auth";
import { fromCompressedId, genCompressedId } from "~api/id";
import { PrismaClient } from "db-totality";
import { DataFunctionArgs } from "@remix-run/server-runtime";

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
  private dbClient: PrismaClient;
  private authClient: AuthClient;
  constructor(private args: DataFunctionArgs) {
    this.dbClient = new PrismaClient();
    this.authClient = new AuthClient(args);
  }

  async onboard(req: OnboardingRequest): Promise<OnboardingResult> {
    const userId = genCompressedId();
    const workspaceId = genCompressedId();
    const user = await this.authClient.getUser(req.userId);

    this.dbClient.$connect();
    try {
      await this.dbClient.$transaction([
        this.dbClient.user.create({
          data: {
            id: fromCompressedId(userId),
            provider_id: req.userId,
            provider_type: req.providerType,
            email: user.primaryEmailAddressId
              ? user.emailAddresses.find(
                  (e) => e.id === user.primaryEmailAddressId
                )!.emailAddress
              : "loopback@empire-builder.online",
          },
        }),
        this.dbClient.workspace.create({
          data: {
            id: fromCompressedId(workspaceId),
            name: req.workspaceName,
            owner: fromCompressedId(userId),
            created_at: new Date(),
            created_by: fromCompressedId(userId),
          },
        }),
      ]);
    } finally {
      this.dbClient.$disconnect();
    }

    await this.authClient.updateUserPublicMetadata(req.userId, {
      appUserId: userId,
      workspaces: [workspaceId],
    });

    return {
      userId,
      workspaceId,
    };
  }

  async createWorkspace(name: string) {
    const workspaceId = genCompressedId();
    const { customClaims, userId } = await requireOnboarded(this.args);

    this.dbClient.$connect();
    try {
      this.dbClient.workspace.create({
        data: {
          id: fromCompressedId(workspaceId),
          name: name,
          owner: fromCompressedId(customClaims.appUserId),
          created_at: new Date(),
          created_by: fromCompressedId(customClaims.appUserId),
        },
      });
    } finally {
      this.dbClient.$disconnect();
    }

    await this.authClient.updateUserPublicMetadata(userId, {
      ...customClaims,
      workspaces: [...customClaims.workspaces, workspaceId],
    });

    return {
      workspaceId,
    };
  }

  async getAllWorkspaces() {
    const { customClaims } = await requireOnboarded(this.args);

    return await this.dbClient.workspace.findMany({
      where: {
        id: {
          in: customClaims.workspaces.map(fromCompressedId),
        },
      },
    });
  }

  async getWorkspaceInfo(workspaceId: string) {
    const { customClaims } = await requireOnboarded(this.args);
    if (!customClaims.workspaces.includes(workspaceId))
      throw new Response("Unauthorized", { status: 403 });

    // TODO: return accounts, buckets etc
    return {};
  }
}
