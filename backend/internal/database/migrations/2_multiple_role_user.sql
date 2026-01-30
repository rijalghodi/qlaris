-- +migrate Up

ALTER TABLE users
ADD COLUMN pin_hash TEXT,
ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT true;

ALTER TABLE users
ALTER COLUMN email DROP NOT NULL;

ALTER TABLE businesses
ADD COLUMN logo TEXT,
ADD COLUMN employee_size VARCHAR(32) CHECK (
  employee_size IN (
    '0',
    '1-5',
    '6-10',
    '11-25',
    '26+'
  )
),
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
DROP COLUMN IF EXISTS employee_size,
DROP COLUMN IF EXISTS category,
DROP COLUMN IF EXISTS code;

ALTER TABLE users
DROP COLUMN IF EXISTS pin_hash,
DROP COLUMN IF EXISTS is_active;