/*
  Warnings:

  - A unique constraint covering the columns `[groupId,userId]` on the table `Payment` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Payment_groupId_userId_key" ON "Payment"("groupId", "userId");
