-- +migrate Up

CREATE TYPE employee_role AS ENUM ('manager', 'cashier');

CREATE TABLE employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  role employee_role NOT NULL,
  name VARCHAR(255) NOT NULL,
  image TEXT,
  pin_hash TEXT NOT NULL,
  phone VARCHAR(20),
  email VARCHAR(255),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE businesses
ADD COLUMN logo TEXT,
ADD COLUMN employee_count SMALLINT DEFAULT 0 CHECK (employee_count >= 0),
ADD COLUMN category VARCHAR(32) CHECK (
  category IN (
    'cafe',
    'restaurant',
    'food_stall',
    'retail',
    'grocery',
    'minimarket',
    'bakery',
    'pharmacy',
    'fashion',
    'laundry',
    'barbershop',
    'printing',
    'other'
  )
),
ADD COLUMN code VARCHAR(16) NOT NULL UNIQUE
DEFAULT floor(random() * 1000000)::text;

-- +migrate Down

ALTER TABLE businesses
DROP COLUMN IF EXISTS logo,
DROP COLUMN IF EXISTS employee_count,
DROP COLUMN IF EXISTS category,
DROP COLUMN IF EXISTS code;

DROP TABLE IF EXISTS employees;
DROP TYPE IF EXISTS employee_role;
