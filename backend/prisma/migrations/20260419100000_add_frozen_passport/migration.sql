-- AlterTable User: add frozen + passportId
ALTER TABLE "User" ADD COLUMN "frozen" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "User" ADD COLUMN "passportId" TEXT;

-- AlterTable Store: add frozen
ALTER TABLE "Store" ADD COLUMN "frozen" BOOLEAN NOT NULL DEFAULT false;
