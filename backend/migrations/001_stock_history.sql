-- Migration: Stock timestamps + StockHistory audit table
-- Option A: Run sequelize sync: node -e "require('./src/models'); require('./config/database').sync({alter:true})"
-- Option B: Run this SQL manually

-- 1. Add timestamps to stock (skip if columns already exist)
-- ALTER TABLE stock ADD COLUMN createdAt DATETIME DEFAULT CURRENT_TIMESTAMP;
-- ALTER TABLE stock ADD COLUMN updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- 2. Create stock_history table
CREATE TABLE IF NOT EXISTS stock_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  stockId INT NOT NULL,
  itemId INT NOT NULL,
  action ENUM('ENTRY', 'ADD', 'EDIT', 'DELETE') NOT NULL,
  qtyBefore DECIMAL(10, 2) NULL,
  qtyAfter DECIMAL(10, 2) NULL,
  buyingPriceBefore DECIMAL(10, 2) NULL,
  buyingPriceAfter DECIMAL(10, 2) NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_stock_history_stockId (stockId),
  INDEX idx_stock_history_itemId (itemId),
  INDEX idx_stock_history_createdAt (createdAt)
);
