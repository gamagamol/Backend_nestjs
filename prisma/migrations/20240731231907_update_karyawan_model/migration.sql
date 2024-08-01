/*
  Warnings:

  - You are about to drop the column `deleted_at` on the `Karyawan` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Karyawan` DROP COLUMN `deleted_at`,
    MODIFY `updated_at` DATETIME(3) NULL;
