   CREATE TABLE users (
     id INT AUTO_INCREMENT PRIMARY KEY,
     email VARCHAR(255) NOT NULL UNIQUE,
     password_hash VARCHAR(255) NOT NULL,
     role ENUM('user','admin') DEFAULT 'user',
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );

   CREATE TABLE stocks (
     id INT AUTO_INCREMENT PRIMARY KEY,
     symbol VARCHAR(10) NOT NULL UNIQUE,
     name VARCHAR(255) NOT NULL,
     price DECIMAL(12,2) NOT NULL,
     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
   );

   CREATE TABLE portfolios (
     id INT AUTO_INCREMENT PRIMARY KEY,
     user_id INT NOT NULL,
     cash_balance DECIMAL(14,2) DEFAULT 100000.00,
     FOREIGN KEY (user_id) REFERENCES users(id)
   );

   CREATE TABLE transactions (
     id INT AUTO_INCREMENT PRIMARY KEY,
     portfolio_id INT NOT NULL,
     stock_id INT NOT NULL,
     type ENUM('buy','sell') NOT NULL,
     quantity INT NOT NULL,
     price DECIMAL(12,2) NOT NULL,
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
     FOREIGN KEY (portfolio_id) REFERENCES portfolios(id),
     FOREIGN KEY (stock_id) REFERENCES stocks(id)
   );