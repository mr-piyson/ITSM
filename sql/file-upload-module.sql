-- File Upload Module tables (MySQL / ISS schema)
-- Run against the ISS database before using /api/uploads persistence.

CREATE TABLE IF NOT EXISTS `ISS`.`File` (
  `id` varchar(191) NOT NULL,
  `filename` varchar(255) NOT NULL,
  `originalName` varchar(255) NOT NULL,
  `hash` varchar(64) NOT NULL,
  `storagePath` varchar(500) NOT NULL,
  `mime` varchar(100) NOT NULL,
  `extension` varchar(20) NOT NULL,
  `size` int NOT NULL,
  `width` int NULL,
  `height` int NULL,
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `File_hash_key` (`hash`),
  UNIQUE KEY `File_storagePath_key` (`storagePath`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `ISS`.`Attachment` (
  `id` varchar(191) NOT NULL,
  `fileId` varchar(191) NOT NULL,
  `entityType` varchar(100) NOT NULL,
  `entityId` varchar(191) NOT NULL,
  `field` varchar(100) NULL,
  `label` varchar(255) NULL,
  `uploadedById` varchar(191) NULL,
  `organizationId` varchar(191) NOT NULL,
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `Attachment_entityType_entityId_idx` (`entityType`, `entityId`),
  KEY `Attachment_organizationId_idx` (`organizationId`),
  KEY `Attachment_fileId_idx` (`fileId`),
  CONSTRAINT `Attachment_fileId_fkey` FOREIGN KEY (`fileId`) REFERENCES `ISS`.`File` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
