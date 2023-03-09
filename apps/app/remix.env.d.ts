/// <reference types="@remix-run/dev" />
/// <reference types="@remix-run/node" />

type Func<A, B> = (a: A) => B;
type ReturnTypePromise<T> = T extends Func<infer _, Promise<infer A>> ? A : never;
type FirstParam<T> = T extends Func<infer A, infer _> ? A : never;
type NonEmptyArray<T> = [T, ...T[]];

type WithNullable<T, K extends keyof T> = { [P in K]: T[P] | null } & Omit<T, K>;
