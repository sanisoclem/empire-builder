/*
  Warnings:

  - You are about to drop the column `currency` on the `account` table. All the data in the column will be lost.
  - Added the required column `currency_id` to the `account` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "account" DROP COLUMN "currency",
ADD COLUMN     "currency_id" VARCHAR(20) NOT NULL;

-- CreateTable
CREATE TABLE "currency" (
    "id" VARCHAR(20) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "precision" INTEGER NOT NULL,

    CONSTRAINT "currency_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "account" ADD CONSTRAINT "account_currency_id_fkey" FOREIGN KEY ("currency_id") REFERENCES "currency"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

INSERT INTO "currency"("id", "name", "precision") 
VALUES
  ('AUD', 'Australian Dollar', 2),
  ('USD', 'U.S. Dollar', 2),
  ('BTC', 'Bitcoin', 8),
  ('ETH', 'Ethereum', 8) -- using all 18 digits would make things complicated