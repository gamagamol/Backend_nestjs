-- CreateTable
CREATE TABLE `Karyawan` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nama` VARCHAR(191) NOT NULL,
    `nomor` VARCHAR(191) NOT NULL,
    `jabatan` VARCHAR(191) NOT NULL,
    `department` VARCHAR(191) NOT NULL,
    `tanggal_masuk` DATETIME(3) NOT NULL,
    `photo` VARCHAR(191) NOT NULL,
    `status` ENUM('CONTRACT', 'PERMANENT', 'PROBATION') NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
