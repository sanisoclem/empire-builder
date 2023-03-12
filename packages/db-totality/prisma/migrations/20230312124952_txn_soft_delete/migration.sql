-- AlterTable
ALTER TABLE "transaction" ADD COLUMN     "deleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "meta" JSONB NOT NULL DEFAULT '{}';
