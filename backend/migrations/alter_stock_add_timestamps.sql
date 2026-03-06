-- Add timestamps to stock table
-- Run this to enable createdAt/updatedAt tracking on stock rows

ALTER TABLE stock
  ADD COLUMN createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;
