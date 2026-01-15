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
CREATE TYPE USER_ROLE AS ENUM ('owner', 'superadmin');

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password_hash TEXT,
    role USER_ROLE NOT NULL DEFAULT 'owner',
    google_image TEXT,
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_at TIMESTAMP NOT NULL DEFAULT now(),
    deleted_at TIMESTAMP
);

-- Unique email where deleted_at IS NULL (enforce unique among active users)
CREATE UNIQUE INDEX unique_email_active ON users(email) WHERE deleted_at IS NULL;

-- =========================================
-- Business (single business for MVP)
-- =========================================
CREATE TABLE businesses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  address TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX unique_user_id ON businesses(user_id);

-- =========================================
-- PRODUCTS (simple, stock included)
-- =========================================
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  price NUMERIC(12,2) NOT NULL CHECK (price >= 0),
  image TEXT,
  stock_qty INTEGER NOT NULL DEFAULT 0 CHECK (stock_qty >= 0),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now()
);

-- =========================================
-- TRANSACTIONS (sales header)
-- =========================================
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id),
  total_amount NUMERIC(12,2) NOT NULL CHECK (total_amount >= 0),
  payment_method TEXT NOT NULL CHECK (payment_method = 'cash'),
  created_at TIMESTAMP NOT NULL DEFAULT now()
);

-- =========================================
-- TRANSACTION ITEMS (line items)
-- =========================================
CREATE TABLE transaction_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id),
  product_name VARCHAR(255) NOT NULL,
  price NUMERIC(12,2) NOT NULL CHECK (price >= 0),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  subtotal NUMERIC(12,2) NOT NULL CHECK (subtotal >= 0)
);

-- =========================================
-- INDEXES (performance)
-- =========================================
CREATE INDEX idx_products_business_id ON products(business_id);
CREATE INDEX idx_transactions_business_id ON transactions(business_id);
CREATE INDEX idx_transactions_created_at ON transactions(created_at);
CREATE INDEX idx_transaction_items_transaction_id ON transaction_items(transaction_id);

-- =========================================
-- END OF SCHEMA
-- =========================================

-- +migrate Down
-- Drop tables in reverse order (respecting foreign key constraints)
DROP TABLE IF EXISTS transaction_items;
DROP TABLE IF EXISTS transactions;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS businesses;
DROP TABLE IF EXISTS users;

-- Drop type
DROP TYPE IF EXISTS USER_ROLE;

-- Drop extension
DROP EXTENSION IF EXISTS "pgcrypto";