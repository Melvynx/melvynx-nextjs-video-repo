/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `Post` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `slug` to the `Post` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable



ALTER TABLE "Post" ADD COLUMN     "slug" TEXT;

-- Update existing posts to have a slug based on their title
UPDATE "Post"
SET "slug" = REPLACE(title, ' ', '_')
WHERE "slug" IS NULL;

-- Make slug column required after populating it
ALTER TABLE "Post" ALTER COLUMN "slug" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Post_slug_key" ON "Post"("slug");
