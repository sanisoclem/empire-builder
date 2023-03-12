type Routes<T> = {
  [K in keyof T]: T[K] extends RouteValue<unknown> ? T[K] : never;
};

type RouteValue<T> = string | ((v: string) => Routes<T>) | Routes<T>;

const wrapRouteValue = <T extends RouteValue<any>>(prefix: string, routeValue: T): T => {
  if (typeof routeValue === 'string') return `${prefix}${routeValue}` as T;
  if (typeof routeValue === 'object')
    return Object.entries(routeValue).reduce(
      (acc, [k, v]) => ({
        ...acc,
        [k]: wrapRouteValue(prefix, v as any)
      }),
      {}
    ) as T;

  return ((innerPrefix: string) =>
    Object.entries(routeValue(innerPrefix)).reduce(
      (acc, [k, v]) => ({
        ...acc,
        [k]: wrapRouteValue(prefix, v as any)
      }),
      {}
    )) as T;
};

const route = <T extends Routes<any>>(prefix: string, routes: T): T =>
  wrapRouteValue(prefix, routes);

const parameterizedRoute =
  <T extends Routes<any>>(getPrefix: (v: string) => string, routes: T) =>
  (prefix: string): T =>
    wrapRouteValue(getPrefix(prefix), routes);

export const ROUTES = route('/', {
  signin: 'signin',
  signup: 'signup',
  signedOut: 'signed-out',
  onboarding: route('onboarding/', {
    start: '',
    complete: 'complete',
    undo: 'undo'
  }),
  home: '',
  createWorkspace: 'create-workspace',
  workspace: parameterizedRoute((workspaceId) => `ws/${workspaceId}/`, {
    dashboard: 'dashboard',
    account: route('a/', {
      list: '',
      create: 'create',
      item: parameterizedRoute((accountId) => `${accountId}/`, {
        transactions: '',
        update: 'update',
        postTransaction: 'post-txn',
        postTransactions: 'post-txns',
        txn: parameterizedRoute((txnId) => `del/${txnId}/`, {
          delete: ''
        })
      })
    }),
    bucket: route('b/', {
      budget: '',
      create: 'create',
      organize: 'organize',
      item: parameterizedRoute((bucketId) => `${bucketId}/`, {
        update: 'update'
      })
    }),
    stock: route('s/', {
      manage: ''
    }),
    otherAssets: route('o/', {
      manage: ''
    })
  })
});

export const ROUTE_DEFS = {
  workspace: 'routes/ws.$workspaceId'
} as const;
