-- Clients
CREATE TABLE clients (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL
);

-- Invoices
CREATE TABLE invoices (
  id INTEGER PRIMARY KEY,
  client_id INTEGER NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  paid_amount DECIMAL(12,2) DEFAULT 0,
  issue_date TEXT NOT NULL,   -- YYYY-MM-DD
  due_date TEXT NOT NULL,
  FOREIGN KEY(client_id) REFERENCES clients(id) ON DELETE RESTRICT
);

-- Payments
CREATE TABLE payments (
  id INTEGER PRIMARY KEY,
  invoice_id INTEGER NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  payment_date TEXT NOT NULL,
  FOREIGN KEY(invoice_id) REFERENCES invoices(id) ON DELETE RESTRICT
);

-- Inventory
CREATE TABLE inventory (
  id INTEGER PRIMARY KEY,
  sku TEXT UNIQUE NOT NULL,
  fabric TEXT,
  color TEXT,
  print TEXT,
  texture TEXT,
  stock_quantity INTEGER DEFAULT 0,
  reorder_level INTEGER DEFAULT 5,
  last_updated TEXT DEFAULT CURRENT_TIMESTAMP
);
