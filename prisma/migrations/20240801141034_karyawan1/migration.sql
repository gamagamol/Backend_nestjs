/*
  Warnings:

  - You are about to alter the column `nomor` on the `Karyawan` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.

*/
-- AlterTable
ALTER TABLE `Karyawan` MODIFY `nomor` INTEGER NOT NULL;
