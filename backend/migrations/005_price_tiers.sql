-- Migration: Price tiers and per-item pricing per tier
-- Target: MySQL

START TRANSACTION;

-- 1) Create price_tiers table
CREATE TABLE IF NOT EXISTS `price_tiers` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL,
  `description` VARCHAR(255) NULL,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_price_tiers_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2) Create price_tier_items table
CREATE TABLE IF NOT EXISTS `price_tier_items` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `priceTierId` INT UNSIGNED NOT NULL,
  `itemId` INT NOT NULL,
  `sellingPrice` DECIMAL(10,2) NOT NULL,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_price_tier_item` (`priceTierId`, `itemId`),
  KEY `idx_pti_item` (`itemId`),
  CONSTRAINT `fk_pti_tier` FOREIGN KEY (`priceTierId`) REFERENCES `price_tiers`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_pti_item` FOREIGN KEY (`itemId`) REFERENCES `items`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3) Alter customer to add optional priceTierId
ALTER TABLE `customer`
  ADD COLUMN `priceTierId` INT UNSIGNED NULL AFTER `address`;

-- Create index and FK for the new column
ALTER TABLE `customer`
  ADD KEY `idx_customer_priceTierId` (`priceTierId`),
  ADD CONSTRAINT `fk_customer_price_tier` FOREIGN KEY (`priceTierId`) REFERENCES `price_tiers`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

COMMIT;