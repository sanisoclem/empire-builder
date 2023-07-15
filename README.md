### Run Locally

Create `.env` files:

- `apps/app/.env`

    ```env
    CLERK_PUBLISHABLE_KEY=[get from clerk]
    CLERK_SECRET_KEY=[get from clerk]
    VERCEL_ENV=development
    VERCEL_GIT_COMMIT_REF=localdev
    VERCEL_GIT_COMMIT_SHA=000000000000
    APP_SIGNEDOUT_URL=http://localhost:3000
    VERCEL_URL=localhost:3000
    DATABASE_URL=[postgres db url]
    ```

- `packages/db-totality/.env`

    ```env
    DATABASE_URL=[postgres db url]
    # we can't create dbs on neon so specify a branch to use as shadow db
    SHADOW_DATABASE_URL=[postgres db url]
    ```

```sh
$ npm install -g pnpm eslint turbo
$ pnpm install
$ turbo dev --filter=app
```

### DB Migration


1. Edit `schema.prisma`
1. Run `turbo db:migrate` - this will create a new migration SQL file and apply it to the db `DATABASE_URL` points to
1. Run `turbo db:generate` - this will regenerate bindings
1. Run `turbo db:deploy` (Optional) - applies all migrations to the db `DATABASE_URL` points to. For the `main` db branch, this is automatic (configured in the vercel pipeline).