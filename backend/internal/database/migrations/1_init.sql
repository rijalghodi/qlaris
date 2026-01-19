-- +migrate Up
-- =========================================
-- Qlaris POS - Phase 1 (MVP)
-- PostgreSQL Schema (Single File)
-- =========================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =========================================
-- USERS (Owner only - email/password)
-- =========================================
CREATE TYPE USER_ROLE AS ENUM ('owner', 'superadmin', 'cashier', 'manager');

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password_hash TEXT,
    role USER_ROLE NOT NULL,
    google_image TEXT,
    image TEXT,
    business_id UUID REFERENCES businesses(id) ON DELETE SET NULL,
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    request_verification_at TIMESTAMPTZ,
    request_reset_password_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ
);

-- Unique constraint
CREATE UNIQUE INDEX unique_email_active ON users(email) WHERE deleted_at IS NULL;
CREATE UNIQUE INDEX unique_owner_id ON users(business_id) WHERE role = 'owner';

-- =========================================
-- Business (single business for MVP)
-- =========================================
CREATE TABLE businesses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- =========================================
-- PRODUCTS (simple, stock included)
-- =========================================
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TYPE BARCODE_TYPE AS ENUM ('ean13', 'ean8', 'upc');

CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  price NUMERIC(12,2) NOT NULL CHECK (price >= 0),
  cost NUMERIC(12,2) NOT NULL CHECK (cost >= 0),
  image TEXT,
  stock_qty INTEGER NOT NULL DEFAULT 0 CHECK (stock_qty >= 0),
  is_active BOOLEAN NOT NULL DEFAULT true,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  unit VARCHAR(36),
  barcode_value VARCHAR(36),
  barcode_type BARCODE_TYPE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX unique_barcode ON products(barcode_value, business_id) WHERE barcode_value IS NOT NULL;

-- =========================================
-- TRANSACTIONS (sales header)
-- =========================================
CREATE TYPE TRANSACTION_STATUS AS ENUM ('pending', 'paid', 'expired', 'cancelled');

CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id),
  created_by UUID NOT NULL REFERENCES users(id),
  total_amount NUMERIC(12,2) NOT NULL CHECK (total_amount >= 0),
  received_amount NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (received_amount >= 0),
  change_amount NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (change_amount >= 0),
  status TRANSACTION_STATUS NOT NULL DEFAULT 'pending',
  invoice_number VARCHAR(36),
  paid_at TIMESTAMPTZ,
  expired_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX unique_invoice_number ON transactions(invoice_number, business_id) WHERE invoice_number IS NOT NULL;

-- =========================================
-- TRANSACTION ITEMS (line items)
-- =========================================
CREATE TABLE transaction_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  product_name VARCHAR(255) NOT NULL,
  price NUMERIC(12,2) NOT NULL CHECK (price >= 0),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  subtotal NUMERIC(12,2) NOT NULL CHECK (subtotal >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =========================================
-- INDEXES (performance)
-- =========================================
CREATE INDEX idx_products_business_id ON products(business_id);
CREATE INDEX idx_transactions_business_id ON transactions(business_id);
CREATE INDEX idx_transactions_created_at ON transactions(created_at);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transaction_items_transaction_id ON transaction_items(transaction_id);

-- =========================================
-- END OF SCHEMA
-- =========================================

-- +migrate Down
-- Drop tables in reverse order (respecting foreign key constraints)
DROP TABLE IF EXISTS transaction_items;
DROP TABLE IF EXISTS transactions;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS businesses;
DROP TABLE IF EXISTS users;

-- Drop type
DROP TYPE IF EXISTS TRANSACTION_STATUS;
DROP TYPE IF EXISTS USER_ROLE;
DROP TYPE IF EXISTS BARCODE_TYPE;

-- Drop extension
DROP EXTENSION IF EXISTS "pgcrypto";