-- CreateEnum
CREATE TYPE "UserPlan" AS ENUM ('BRONZE', 'IRON', 'GOLD');

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "plan" "UserPlan" NOT NULL DEFAULT 'BRONZE';
