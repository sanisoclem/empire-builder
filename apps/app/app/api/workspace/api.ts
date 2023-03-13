import { AuthClient, requireOnboarded } from '~api/auth';
import { fromCompressedId, genCompressedId, toCompressedId } from '~api/id';
import { DbClient } from 'db-totality';
import { DataFunctionArgs } from '@remix-run/server-runtime';
import { z } from 'zod';
import { mapNonEmpty } from '~api/array';
import {
  addDraft,
  addExchange,
  addExternal,
  addTransfer,
  ledgerBalanceSchema,
  verifyBalance
} from './balance';

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
      amount: z.number().int(),
      payee: z.string()
    }),
    z.object({
      type: z.literal('transfer'),
      accountId: z.number(),
      otherAccountId: z.number(),
      otherAmount: z.number().int().nullable(),
      amount: z.number().int(),
      payee: z.string()
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
      balance?.ledger_balance ? ledgerBalanceSchema.parse(balance.ledger_balance) : {}
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
            superseded_by: null,
            deleted: false
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

  // TODO: refactor repetitive txn code
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
            payee: string;
          }
        | {
            type: 'transfer';
            otherAccountId: number;
            otherAmount: number | null;
            amount: number;
            payee: string;
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
          latestBalance === null ? {} : ledgerBalanceSchema.parse(latestBalance.ledger_balance);

        for (let i = 0; i < txn.data.length; i++) {
          const d = txn.data[i];
          switch (d.type) {
            case 'draft':
              addDraft(bal, txn.accountId.toString(), account.currency_id, d.amount);
              break;
            case 'external':
              addExternal(
                bal,
                txn.accountId.toString(),
                d.bucketId.toString(),
                account.currency_id,
                d.amount
              );
              break;
            case 'transfer':
              const otherAccount = await c.account.findUniqueOrThrow({
                where: {
                  workspace_id_id: {
                    id: d.otherAccountId,
                    workspace_id: fromCompressedId(workspaceId)
                  }
                }
              });
              if (otherAccount.currency_id !== account.currency_id) {
                if (!d.otherAmount) throw new Error('Other amount must be specified');
                addExchange(
                  bal,
                  txn.accountId.toString(),
                  account.currency_id,
                  d.otherAccountId.toString(),
                  otherAccount.currency_id,
                  d.amount,
                  Math.abs(d.otherAmount)
                );
              } else {
                addTransfer(
                  bal,
                  txn.accountId.toString(),
                  d.otherAccountId.toString(),
                  account.currency_id,
                  d.amount
                );
              }
              break;
          }
        }
        verifyBalance(bal);

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
            deleted: false,
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
            payee: string;
          }
        | {
            type: 'transfer';
            otherAccountId: number;
            otherAmount: number | null;
            amount: number;
            payee: string;
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

        for (let i = 0; i < existinTxnData.length; i++) {
          const d = existinTxnData[i];
          switch (d.type) {
            case 'draft':
              addDraft(bal, txn.accountId.toString(), account.currency_id, d.amount * -1);
              break;
            case 'external':
              addExternal(
                bal,
                txn.accountId.toString(),
                d.bucketId.toString(),
                account.currency_id,
                d.amount * -1
              );
              break;
            case 'transfer':
              const otherAccount = await c.account.findUniqueOrThrow({
                where: {
                  workspace_id_id: {
                    id: d.otherAccountId,
                    workspace_id: fromCompressedId(workspaceId)
                  }
                }
              });
              if (otherAccount.currency_id !== account.currency_id) {
                if (!d.otherAmount) throw new Error('Other amount must be specified');
                addExchange(
                  bal,
                  txn.accountId.toString(),
                  account.currency_id,
                  d.otherAccountId.toString(),
                  otherAccount.currency_id,
                  d.amount * -1,
                  Math.abs(d.otherAmount)
                );
              } else {
                addTransfer(
                  bal,
                  txn.accountId.toString(),
                  d.otherAccountId.toString(),
                  account.currency_id,
                  d.amount * -1
                );
              }
              break;
          }
        }
        verifyBalance(bal);

        for (let i = 0; i < txn.data.length; i++) {
          const d = txn.data[i];
          switch (d.type) {
            case 'draft':
              addDraft(bal, txn.accountId.toString(), account.currency_id, d.amount);
              break;
            case 'external':
              addExternal(
                bal,
                txn.accountId.toString(),
                d.bucketId.toString(),
                account.currency_id,
                d.amount
              );
              break;
            case 'transfer':
              const otherAccount = await c.account.findUniqueOrThrow({
                where: {
                  workspace_id_id: {
                    id: d.otherAccountId,
                    workspace_id: fromCompressedId(workspaceId)
                  }
                }
              });
              if (otherAccount.currency_id !== account.currency_id) {
                if (!d.otherAmount) throw new Error('Other amount must be specified');
                addExchange(
                  bal,
                  txn.accountId.toString(),
                  account.currency_id,
                  d.otherAccountId.toString(),
                  otherAccount.currency_id,
                  d.amount,
                  Math.abs(d.otherAmount)
                );
              } else {
                addTransfer(
                  bal,
                  txn.accountId.toString(),
                  d.otherAccountId.toString(),
                  account.currency_id,
                  d.amount
                );
              }
              break;
          }
        }
        verifyBalance(bal);

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
            deleted: false,
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

  async postTransactions(
    workspaceId: string,
    accountId: number,
    txns: Array<{
      date: Date;
      note: string;
      data: NonEmptyArray<
        | {
            type: 'draft';
            amount: number;
            payee: string;
          }
        | {
            type: 'transfer';
            otherAccountId: number;
            otherAmount: number | null;
            amount: number;
            payee: string;
          }
        | {
            type: 'external';
            bucketId: number;
            amount: number;
            payee: string;
          }
      >;
      meta: Record<string, string | undefined>;
    }>
  ) {
    const { customClaims } = await requireOnboarded(this.args);
    if (!customClaims.workspaces.includes(workspaceId))
      throw new Response('Unauthorized', { status: 403 });

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
              id: accountId,
              workspace_id: fromCompressedId(workspaceId)
            }
          }
        });

        const bal =
          latestBalance === null ? {} : ledgerBalanceSchema.parse(latestBalance.ledger_balance);

        for (let ti = 0; ti < txns.length; ti++) {
          const txn = txns[ti];
          for (let i = 0; i < txn.data.length; i++) {
            const d = txn.data[i];
            switch (d.type) {
              case 'draft':
                addDraft(bal, accountId.toString(), account.currency_id, d.amount);
                break;
              case 'external':
                addExternal(
                  bal,
                  accountId.toString(),
                  d.bucketId.toString(),
                  account.currency_id,
                  d.amount
                );
                break;
              case 'transfer':
                const otherAccount = await c.account.findUniqueOrThrow({
                  where: {
                    workspace_id_id: {
                      id: d.otherAccountId,
                      workspace_id: fromCompressedId(workspaceId)
                    }
                  }
                });
                if (otherAccount.currency_id !== account.currency_id) {
                  if (!d.otherAmount) throw new Error('Other amount must be specified');
                  addExchange(
                    bal,
                    accountId.toString(),
                    account.currency_id,
                    d.otherAccountId.toString(),
                    otherAccount.currency_id,
                    d.amount,
                    Math.abs(d.otherAmount)
                  );
                } else {
                  addTransfer(
                    bal,
                    accountId.toString(),
                    d.otherAccountId.toString(),
                    account.currency_id,
                    d.amount
                  );
                }
                break;
            }
          }
        }
        verifyBalance(bal);

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
        const createAt = new Date();
        await c.transaction.createMany({
          data: txns.map((txn) => ({
            create_at: createAt,
            created_by: fromCompressedId(customClaims.appUserId),
            workspace_id: fromCompressedId(workspaceId),
            date: txn.date,
            notes: txn.note,
            meta: txn.meta,
            deleted: false,
            balance: id,
            data: txnDataSchema.parse(txn.data.map((d) => ({ ...d, accountId: accountId }))),
            superseded_by: null
          }))
        });
      },
      { isolationLevel: 'RepeatableRead' }
    );
  }

  async deleteTransaction(workspaceId: string, accountId: number, txnId: number) {
    const { customClaims } = await requireOnboarded(this.args);
    if (!customClaims.workspaces.includes(workspaceId))
      throw new Response('Unauthorized', { status: 403 });

    await this.dbClient.client.$transaction(
      async (c) => {
        const txn = await c.transaction.findFirstOrThrow({
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
              id: accountId,
              workspace_id: fromCompressedId(workspaceId)
            }
          }
        });

        const bal = ledgerBalanceSchema.parse(latestBalance.ledger_balance);
        const existinTxnData = txnDataSchema.parse(txn.data);

        for (let i = 0; i < existinTxnData.length; i++) {
          const d = existinTxnData[i];
          switch (d.type) {
            case 'draft':
              addDraft(bal, accountId.toString(), account.currency_id, d.amount * -1);
              break;
            case 'external':
              addExternal(
                bal,
                accountId.toString(),
                d.bucketId.toString(),
                account.currency_id,
                d.amount * -1
              );
              break;
            case 'transfer':
              const otherAccount = await c.account.findUniqueOrThrow({
                where: {
                  workspace_id_id: {
                    id: d.otherAccountId,
                    workspace_id: fromCompressedId(workspaceId)
                  }
                }
              });
              if (otherAccount.currency_id !== account.currency_id) {
                if (!d.otherAmount) throw new Error('Other amount must be specified');
                addExchange(
                  bal,
                  accountId.toString(),
                  account.currency_id,
                  d.otherAccountId.toString(),
                  otherAccount.currency_id,
                  d.amount * -1,
                  Math.abs(d.otherAmount)
                );
              } else {
                addTransfer(
                  bal,
                  accountId.toString(),
                  d.otherAccountId.toString(),
                  account.currency_id,
                  d.amount * -1
                );
              }
              break;
          }
        }
        verifyBalance(bal);

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
            create_at: txn.create_at,
            created_by: txn.created_by,
            workspace_id: txn.workspace_id,
            deleted: true,
            date: txn.date,
            notes: txn.notes,
            meta: txn.meta ?? {},
            data: txn.data ?? {},
            balance: id,
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
