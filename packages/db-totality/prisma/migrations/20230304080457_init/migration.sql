-- CreateTable
CREATE TABLE "user" (
    "id" UUID NOT NULL,
    "provider_id" VARCHAR(100) NOT NULL,
    "provider_type" VARCHAR(100) NOT NULL,
    "email" TEXT,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workspace" (
    "id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "owner" UUID NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL,
    "created_by" UUID NOT NULL,

    CONSTRAINT "workspace_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "account" (
    "id" SERIAL NOT NULL,
    "workspace_id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "currency" VARCHAR(20) NOT NULL,
    "type" VARCHAR(100),

    CONSTRAINT "account_pkey" PRIMARY KEY ("workspace_id","id")
);

-- CreateTable
CREATE TABLE "balance" (
    "id" SERIAL NOT NULL,
    "workspace_id" UUID NOT NULL,
    "ledger_balance" JSON NOT NULL,
    "budget_balance" JSON NOT NULL,
    "superseded_by" INTEGER,

    CONSTRAINT "balance_pkey" PRIMARY KEY ("workspace_id","id")
);

-- CreateTable
CREATE TABLE "bucket" (
    "id" SERIAL NOT NULL,
    "workspace_id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "category" VARCHAR(100),

    CONSTRAINT "bucket_pkey" PRIMARY KEY ("workspace_id","id")
);

-- CreateTable
CREATE TABLE "trading_account" (
    "id" SERIAL NOT NULL,
    "workspace_id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "precision" SMALLINT NOT NULL,
    "settlement_account" INTEGER NOT NULL,

    CONSTRAINT "trading_account_pkey" PRIMARY KEY ("workspace_id","id")
);

-- CreateTable
CREATE TABLE "transaction" (
    "id" SERIAL NOT NULL,
    "workspace_id" UUID NOT NULL,
    "date" DATE NOT NULL,
    "notes" TEXT,
    "data" JSON NOT NULL,
    "created_by" UUID NOT NULL,
    "create_at" DATE NOT NULL,
    "superseded_by" INTEGER,
    "balance" INTEGER NOT NULL,

    CONSTRAINT "transaction_pkey" PRIMARY KEY ("workspace_id","id")
);

-- CreateIndex
CREATE INDEX "fki_workspace_owner_fkey" ON "workspace"("owner");

-- CreateIndex
CREATE INDEX "fki_account_workspace_id_fkey" ON "account"("workspace_id");

-- CreateIndex
CREATE INDEX "fki_balance_superseded_by_fkey" ON "balance"("workspace_id", "superseded_by");

-- CreateIndex
CREATE INDEX "fki_balance_workspace_id_fkey" ON "balance"("workspace_id");

-- CreateIndex
CREATE UNIQUE INDEX "balance_workspace_id_superseded_by_key" ON "balance"("workspace_id", "superseded_by") NULLS NOT DISTINCT;

-- CreateIndex
CREATE INDEX "fki_bucket_workspace_id_fkey" ON "bucket"("workspace_id");

-- CreateIndex
CREATE INDEX "fki_trading_account_workspace_id_fkey" ON "trading_account"("workspace_id");

-- CreateIndex
CREATE INDEX "fki_transaction_superseded_by_fkey" ON "transaction"("workspace_id", "superseded_by");

-- CreateIndex
CREATE INDEX "fki_transaction_workspace_id_fkey" ON "transaction"("workspace_id");

-- CreateIndex
CREATE UNIQUE INDEX "transaction_workspace_id_superseded_by_key" ON "transaction"("workspace_id", "superseded_by") NULLS NOT DISTINCT;

-- AddForeignKey
ALTER TABLE "workspace" ADD CONSTRAINT "workspace_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "workspace" ADD CONSTRAINT "workspace_owner_fkey" FOREIGN KEY ("owner") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "account" ADD CONSTRAINT "account_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspace"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "balance" ADD CONSTRAINT "balance_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspace"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "balance" ADD CONSTRAINT "balance_workspace_id_superseded_by_fkey" FOREIGN KEY ("workspace_id", "superseded_by") REFERENCES "balance"("workspace_id", "id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "bucket" ADD CONSTRAINT "bucket_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspace"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "trading_account" ADD CONSTRAINT "trading_account_settlement_account_workspace_id_fkey" FOREIGN KEY ("settlement_account", "workspace_id") REFERENCES "account"("id", "workspace_id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "trading_account" ADD CONSTRAINT "trading_account_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspace"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "transaction" ADD CONSTRAINT "transaction_balance_workspace_id_fkey" FOREIGN KEY ("balance", "workspace_id") REFERENCES "balance"("id", "workspace_id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "transaction" ADD CONSTRAINT "transaction_workspace_id_superseded_by_fkey" FOREIGN KEY ("workspace_id", "superseded_by") REFERENCES "transaction"("workspace_id", "id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "transaction" ADD CONSTRAINT "transaction_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspace"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;
