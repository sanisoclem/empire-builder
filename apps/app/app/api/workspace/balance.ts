import { z } from 'zod';

export const ledgerBalanceSchema = z.record(
  z.object({
    accounts: z.record(z.number()),
    buckets: z.record(z.number()),
    floating: z.number(),
    conversions: z.number()
  })
);
export const blankLedgerBalance = {
  accounts: {},
  buckets: {},
  floating: 0,
  conversions: 0
};

export type LedgerBalance = z.infer<typeof ledgerBalanceSchema>;

const addAccountBalance = (
  bal: LedgerBalance,
  accountId: string,
  currencyId: string,
  delta: number
) => {
  if (currencyId in bal) {
    if (accountId in bal[currencyId].accounts) {
      bal[currencyId].accounts[accountId] += delta;
    } else {
      bal[currencyId].accounts[accountId] = delta;
    }
  } else {
    bal[currencyId] = {
      ...blankLedgerBalance,
      accounts: {
        [accountId]: delta
      }
    };
  }

  return bal;
};
const addBucketBalance = (
  bal: LedgerBalance,
  bucketId: string,
  currencyId: string,
  delta: number
) => {
  if (currencyId in bal) {
    if (bucketId in bal[currencyId].buckets) {
      bal[currencyId].buckets[bucketId] += delta;
    } else {
      bal[currencyId].buckets[bucketId] = delta;
    }
  } else {
    bal[currencyId] = {
      ...blankLedgerBalance,
      buckets: {
        [bucketId]: delta
      }
    };
  }

  return bal;
};
const addFloatingBalance = (bal: LedgerBalance, currencyId: string, delta: number) => {
  if (currencyId in bal) {
    bal[currencyId].floating += delta;
  } else {
    bal[currencyId] = {
      ...blankLedgerBalance,
      floating: delta
    };
  }

  return bal;
};
const addConversionBalance = (bal: LedgerBalance, currencyId: string, delta: number) => {
  if (currencyId in bal) {
    bal[currencyId].conversions += delta;
  } else {
    bal[currencyId] = {
      ...blankLedgerBalance,
      conversions: delta
    };
  }

  return bal;
};

export const addTransfer = (
  bal: LedgerBalance,
  a1: string,
  a2: string,
  currency: string,
  amount: number
) => {
  addAccountBalance(bal, a1, currency, amount);
  addAccountBalance(bal, a2, currency, amount * -1);
};

export const addExchange = (
  bal: LedgerBalance,
  a1: string,
  c1: string,
  a2: string,
  c2: string,
  amount: number,
  otherAmount: number
) => {
  addAccountBalance(bal, a1, c1, amount);
  addConversionBalance(bal, c1, amount * -1);

  const amount2 = otherAmount * (Math.abs(amount) / (amount * -1));
  addAccountBalance(bal, a2, c2, amount2);
  addConversionBalance(bal, c2, amount2 * -1);
};

export const addExternal = (
  bal: LedgerBalance,
  accountId: string,
  bucketId: string,
  currency: string,
  amount: number
) => {
  addAccountBalance(bal, accountId, currency, amount);
  addBucketBalance(bal, bucketId, currency, amount * -1);
};

export const addDraft = (
  bal: LedgerBalance,
  accountId: string,
  currency: string,
  amount: number
) => {
  addAccountBalance(bal, accountId, currency, amount);
  addFloatingBalance(bal, currency, amount * -1);
};

export const verifyBalance = (bal: LedgerBalance) => {
  Object.entries(bal).forEach(([currency, bal]) => {
    const accountsBalance = Object.entries(bal.accounts).reduce((acc, [k, v]) => acc + v, 0);
    const bucketsBalance= Object.entries(bal.buckets).reduce((acc, [k, v]) => acc + v, 0);
    if (accountsBalance +bucketsBalance + bal.conversions + bal.floating != 0 ){
      throw new Error (`${currency} is unbalanced`);
    }
  });
};
