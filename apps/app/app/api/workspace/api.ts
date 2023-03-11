import { AuthClient, requireOnboarded } from '~api/auth';
import { fromCompressedId, genCompressedId, toCompressedId } from '~api/id';
import { DbClient } from 'db-totality';
import { DataFunctionArgs } from '@remix-run/server-runtime';
import { z } from 'zod';
import { mapNonEmpty } from '~api/array';

interface OnboardingRequest {
  userId: string;
  providerType: string;
  workspaceName: string;
}
interface OnboardingResult {
  userId: string;
  workspaceId: string;
}
const txnDataSchema = z
  .union([
    z.object({
      accountId: z.number(),
      type: z.literal('draft'),
      amount: z.number().int()
    }),
    z.object({
      type: z.literal('transfer'),
      accountId: z.number(),
      otherAccountId: z.number(),
      otherAmount: z.number().int().nullable(),
      amount: z.number().int()
    }),
    z.object({
      accountId: z.number(),
      type: z.literal('external'),
      bucketId: z.number(),
      amount: z.number().int(),
      payee: z.string()
    })
  ])
  .array()
  .nonempty();

const ledgerBalanceSchema = z.object({
  accounts: z.record(z.number()),
  buckets: z.record(z.record(z.number())),
  floating: z.record(z.number())
});
const blankLedgerBalance = {
  accounts: {},
  buckets: {},
  floating: {}
};

const addAccountBalance = (
  bal: z.infer<typeof ledgerBalanceSchema>,
  accountId: string,
  delta: number
) => {
  if (accountId in bal.accounts) {
    bal.accounts[accountId] += delta;
  } else {
    bal.accounts[accountId] = delta;
  }
  return bal;
};
const addBucketBalance = (
  bal: z.infer<typeof ledgerBalanceSchema>,
  bucketId: string,
  currency: string,
  delta: number
) => {
  if (bucketId in bal.buckets) {
    if (currency in bal.buckets[bucketId]) {
      bal.buckets[bucketId][currency] += delta;
    } else {
      bal.buckets[bucketId][currency] = delta;
    }
  } else {
    bal.buckets[bucketId] = { [currency]: delta };
  }
  return bal;
};
const addFloatingBalance = (
  bal: z.infer<typeof ledgerBalanceSchema>,
  currency: string,
  delta: number
) => {
  if (currency in bal.floating) {
    bal.floating[currency] += delta;
  } else {
    bal.floating[currency] = delta;
  }
  return bal;
};

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

    await this.dbClient.exec((c) =>
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

    return (
      await this.dbClient.client.workspace.findMany({
        where: {
          id: {
            in: customClaims.workspaces.map(fromCompressedId)
          }
        }
      })
    ).map((a) => ({
      ...a,
      id: toCompressedId(a.id),
      owner: toCompressedId(a.owner),
      created_by: toCompressedId(a.created_by)
    }));
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
    accountType: string | null,
    currencyId: string,
    notes: string | null
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

  async updateAccount(
    workspaceId: string,
    accountId: number,
    name: string,
    accountType: string | null,
    notes: string | null
  ) {
    const { customClaims } = await requireOnboarded(this.args);
    if (!customClaims.workspaces.includes(workspaceId))
      throw new Response('Unauthorized', { status: 403 });

    await this.dbClient.exec((c) =>
      c.account.update({
        where: {
          workspace_id_id: {
            id: accountId,
            workspace_id: fromCompressedId(workspaceId)
          }
        },
        data: {
          name,
          type: accountType
        }
      })
    );
  }

  async getAccountBalances(workspaceId: string) {
    const { customClaims } = await requireOnboarded(this.args);
    if (!customClaims.workspaces.includes(workspaceId))
      throw new Response('Unauthorized', { status: 403 });

    const accounts = await this.dbClient.client.account.findMany({
      where: {
        workspace_id: {
          equals: fromCompressedId(workspaceId)
        }
      }
    });

    const balance = await this.dbClient.client.balance.findFirst({
      where: {
        workspace_id: fromCompressedId(workspaceId),
        superseded_by: null
      }
    });

    return [
      accounts,
      balance?.ledger_balance
        ? ledgerBalanceSchema.parse(balance.ledger_balance)
        : blankLedgerBalance
    ] as const;
  }

  async createBucket(workspaceId: string, name: string, category: string | null) {
    const { customClaims } = await requireOnboarded(this.args);
    if (!customClaims.workspaces.includes(workspaceId))
      throw new Response('Unauthorized', { status: 403 });

    const { id } = await this.dbClient.exec((c) =>
      c.bucket.create({
        data: {
          name,
          category,
          workspace_id: fromCompressedId(workspaceId)
        }
      })
    );

    return id;
  }

  async getBucketBalances(workspaceId: string) {
    const { customClaims } = await requireOnboarded(this.args);
    if (!customClaims.workspaces.includes(workspaceId))
      throw new Response('Unauthorized', { status: 403 });

    return await this.dbClient.client.bucket.findMany({
      where: {
        workspace_id: {
          equals: fromCompressedId(workspaceId)
        }
      }
    });
  }
  async organizeBuckets(
    workspaceId: string,
    buckets: Array<{ id: number; category: string | null; order: number }>
  ) {
    const { customClaims } = await requireOnboarded(this.args);
    if (!customClaims.workspaces.includes(workspaceId))
      throw new Response('Unauthorized', { status: 403 });

    await this.dbClient.exec((c) =>
      c.$transaction(
        buckets.map((b) =>
          c.bucket.update({
            where: {
              workspace_id_id: {
                id: b.id,
                workspace_id: fromCompressedId(workspaceId)
              }
            },
            data: {
              category: b.category,
              order: b.order
            }
          })
        )
      )
    );
  }
  async getTransactions(workspaceId: string, accountId: number) {
    const { customClaims } = await requireOnboarded(this.args);
    if (!customClaims.workspaces.includes(workspaceId))
      throw new Response('Unauthorized', { status: 403 });

    const txns = await this.dbClient.client.transaction.findMany({
      orderBy: {
        date: 'desc'
      },
      where: {
        AND: [
          {
            OR: [
              {
                data: {
                  array_contains: [{ accountId: accountId }]
                }
              },
              {
                data: {
                  array_contains: [{ otherAccountId: accountId }]
                }
              }
            ]
          },
          {
            superseded_by: null
          }
        ]
      }
    });

    return txns.map((t) => ({
      ...t,
      data: mapNonEmpty(txnDataSchema.parse(t.data), (d) =>
        d.accountId === accountId
          ? d
          : d.type === 'transfer' && d.otherAccountId === accountId
          ? {
              ...d,
              accountId: accountId,
              otherAccountId: d.accountId,
              amount:
                'otherAmount' in d && d.otherAmount !== null
                  ? d.otherAmount * (Math.abs(d.amount) / (d.amount * -1))
                  : d.amount * -1,
              otherAmount: 'otherAmount' in d && d.otherAmount !== null ? Math.abs(d.amount) : null
            }
          : {
              ...d,
              amount: 0
            }
      )
    }));
  }

  async postTransaction(
    workspaceId: string,
    txn: {
      accountId: number;
      date: Date;
      note: string;
      data: NonEmptyArray<
        | {
            type: 'draft';
            amount: number;
          }
        | {
            type: 'transfer';
            otherAccountId: number;
            otherAmount: number | null;
            amount: number;
          }
        | {
            type: 'external';
            bucketId: number;
            amount: number;
            payee: string;
          }
      >;
    }
  ) {
    const { customClaims } = await requireOnboarded(this.args);
    if (!customClaims.workspaces.includes(workspaceId))
      throw new Response('Unauthorized', { status: 403 });
    // find latest balance
    // find account
    // find linked account/bucket
    // calculate new balance
    // supersede balance, post new balance and txn

    await this.dbClient.client.$transaction(
      async (c) => {
        const latestBalance = await c.balance.findFirst({
          where: {
            workspace_id: fromCompressedId(workspaceId),
            superseded_by: null
          }
        });
        const account = await c.account.findUniqueOrThrow({
          where: {
            workspace_id_id: {
              id: txn.accountId,
              workspace_id: fromCompressedId(workspaceId)
            }
          }
        });

        const bal =
          latestBalance === null
            ? blankLedgerBalance
            : ledgerBalanceSchema.parse(latestBalance.ledger_balance);

        txn.data.forEach((d) => {
          switch (d.type) {
            case 'draft':
              addAccountBalance(bal, txn.accountId.toString(), d.amount);
              addFloatingBalance(bal, account.currency_id, d.amount * -1);
              break;
            case 'external':
              addAccountBalance(bal, txn.accountId.toString(), d.amount);
              addBucketBalance(bal, d.bucketId.toString(), account.currency_id, d.amount * -1);
              break;
            case 'transfer':
              addAccountBalance(bal, txn.accountId.toString(), d.amount);
              addAccountBalance(
                bal,
                d.otherAccountId.toString(),
                d.otherAmount !== null
                  ? d.otherAmount * (Math.abs(d.amount) / (d.amount * -1))
                  : d.amount * -1
              );
              break;
          }
        });
        const { id } = await c.balance.create({
          data: {
            workspace_id: fromCompressedId(workspaceId),
            budget_balance: latestBalance?.budget_balance ?? {},
            ledger_balance: bal,
            superseded_by: null
          }
        });
        if (latestBalance !== null) {
          await c.balance.update({
            where: {
              workspace_id_id: {
                id: latestBalance.id,
                workspace_id: fromCompressedId(workspaceId)
              }
            },
            data: {
              superseded_by: id
            }
          });
        }
        await c.transaction.create({
          data: {
            create_at: new Date(),
            created_by: fromCompressedId(customClaims.appUserId),
            workspace_id: fromCompressedId(workspaceId),
            date: txn.date,
            notes: txn.note,
            balance: id,
            data: txnDataSchema.parse(txn.data.map((d) => ({ ...d, accountId: txn.accountId }))),
            superseded_by: null
          }
        });
      },
      { isolationLevel: 'RepeatableRead' }
    );
  }

  async updateTransaction(
    workspaceId: string,
    txnId: number,
    txn: {
      accountId: number;
      date: Date;
      note: string;
      data: NonEmptyArray<
        | {
            type: 'draft';
            amount: number;
          }
        | {
            type: 'transfer';
            otherAccountId: number;
            otherAmount: number | null;
            amount: number;
          }
        | {
            type: 'external';
            bucketId: number;
            amount: number;
            payee: string;
          }
      >;
    }
  ) {
    const { customClaims } = await requireOnboarded(this.args);
    if (!customClaims.workspaces.includes(workspaceId))
      throw new Response('Unauthorized', { status: 403 });

    await this.dbClient.client.$transaction(
      async (c) => {
        const existingTxn = await c.transaction.findFirstOrThrow({
          where: {
            workspace_id: fromCompressedId(workspaceId),
            superseded_by: null,
            id: txnId
          }
        });
        const latestBalance = await c.balance.findFirstOrThrow({
          where: {
            workspace_id: fromCompressedId(workspaceId),
            superseded_by: null
          }
        });
        const account = await c.account.findUniqueOrThrow({
          where: {
            workspace_id_id: {
              id: txn.accountId,
              workspace_id: fromCompressedId(workspaceId)
            }
          }
        });

        const bal = ledgerBalanceSchema.parse(latestBalance.ledger_balance);
        const existinTxnData = txnDataSchema.parse(existingTxn.data);

        existinTxnData.forEach((d) => {
          switch (d.type) {
            case 'draft':
              addAccountBalance(bal, d.accountId.toString(), d.amount * -1);
              addFloatingBalance(bal, account.currency_id, d.amount * -1);
              break;
            case 'external':
              addAccountBalance(bal, d.accountId.toString(), d.amount * -1);
              addBucketBalance(bal, d.bucketId.toString(), account.currency_id, d.amount);
              break;
            case 'transfer':
              addAccountBalance(bal, d.accountId.toString(), d.amount * -1);
              addAccountBalance(
                bal,
                d.otherAccountId.toString(),
                d.otherAmount !== null ? d.otherAmount * (Math.abs(d.amount) / d.amount) : d.amount
              );
              break;
          }
        });

        txn.data.forEach((d) => {
          switch (d.type) {
            case 'draft':
              addAccountBalance(bal, txn.accountId.toString(), d.amount);
              addFloatingBalance(bal, account.currency_id, d.amount * 1);
              break;
            case 'external':
              addAccountBalance(bal, txn.accountId.toString(), d.amount);
              addBucketBalance(bal, d.bucketId.toString(), account.currency_id, d.amount * -1);
              break;
            case 'transfer':
              addAccountBalance(bal, txn.accountId.toString(), d.amount);
              addAccountBalance(
                bal,
                d.otherAccountId.toString(),
                d.otherAmount !== null
                  ? d.otherAmount * (Math.abs(d.amount) / (d.amount * -1))
                  : d.amount * -1
              );
              break;
          }
        });
        const { id } = await c.balance.create({
          data: {
            workspace_id: fromCompressedId(workspaceId),
            budget_balance: latestBalance?.budget_balance ?? {},
            ledger_balance: bal,
            superseded_by: null
          }
        });
        if (latestBalance !== null) {
          await c.balance.update({
            where: {
              workspace_id_id: {
                id: latestBalance.id,
                workspace_id: fromCompressedId(workspaceId)
              }
            },
            data: {
              superseded_by: id
            }
          });
        }

        const { id: newTxnId } = await c.transaction.create({
          data: {
            create_at: existingTxn.create_at,
            created_by: existingTxn.created_by,
            workspace_id: existingTxn.workspace_id,
            date: txn.date,
            notes: txn.note,
            balance: id,
            data: txnDataSchema.parse(txn.data.map((d) => ({ ...d, accountId: txn.accountId }))),
            superseded_by: null
          }
        });
        await c.transaction.update({
          where: {
            workspace_id_id: {
              id: txnId,
              workspace_id: fromCompressedId(workspaceId)
            }
          },
          data: {
            superseded_by: newTxnId
          }
        });
      },
      { isolationLevel: 'RepeatableRead' }
    );
  }
}
