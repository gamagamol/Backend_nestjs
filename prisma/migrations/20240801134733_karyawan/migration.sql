/*
  Warnings:

  - You are about to drop the column `photo` on the `Karyawan` table. All the data in the column will be lost.
  - Added the required column `foto` to the `Karyawan` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Karyawan` DROP COLUMN `photo`,
    ADD COLUMN `foto` VARCHAR(191) NOT NULL;
