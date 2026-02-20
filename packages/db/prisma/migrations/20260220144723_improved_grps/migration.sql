/*
  Warnings:

  - The values [HEAD] on the enum `GroupRole` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `amountInr` on the `GiftContribution` table. All the data in the column will be lost.
  - You are about to drop the column `headUserId` on the `Group` table. All the data in the column will be lost.
  - You are about to drop the column `amountInr` on the `SavingsTransaction` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "ProposalStatus" AS ENUM ('OPEN', 'CLOSED');

-- AlterEnum
BEGIN;
CREATE TYPE "GroupRole_new" AS ENUM ('ADMIN', 'MEMBER');
ALTER TABLE "public"."GroupMember" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "GroupMember" ALTER COLUMN "role" TYPE "GroupRole_new" USING ("role"::text::"GroupRole_new");
ALTER TYPE "GroupRole" RENAME TO "GroupRole_old";
ALTER TYPE "GroupRole_new" RENAME TO "GroupRole";
DROP TYPE "public"."GroupRole_old";
ALTER TABLE "GroupMember" ALTER COLUMN "role" SET DEFAULT 'MEMBER';
COMMIT;

-- DropForeignKey
ALTER TABLE "Group" DROP CONSTRAINT "Group_headUserId_fkey";

-- AlterTable
ALTER TABLE "GiftContribution" DROP COLUMN "amountInr";

-- AlterTable
ALTER TABLE "Group" DROP COLUMN "headUserId";

-- AlterTable
ALTER TABLE "SavingsTransaction" DROP COLUMN "amountInr";

-- CreateTable
CREATE TABLE "GroupProposal" (
    "id" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "createdBy" TEXT NOT NULL,
    "occasion" TEXT,
    "message" TEXT,
    "deadline" TIMESTAMP(3),
    "status" "ProposalStatus" NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GroupProposal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProposalContribution" (
    "id" TEXT NOT NULL,
    "proposalId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "goldGrams" DECIMAL(65,30) NOT NULL,
    "grailTxnId" TEXT,
    "status" "ContributionStatus" NOT NULL DEFAULT 'PLEDGED',
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProposalContribution_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "GroupProposal" ADD CONSTRAINT "GroupProposal_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProposalContribution" ADD CONSTRAINT "ProposalContribution_proposalId_fkey" FOREIGN KEY ("proposalId") REFERENCES "GroupProposal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProposalContribution" ADD CONSTRAINT "ProposalContribution_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
