-- +migrate Up

CREATE TABLE roles (
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  role USER_ROLE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, business_id)
);

CREATE UNIQUE INDEX uniq_roles_user_business_role
ON roles (user_id, business_id, role);

ALTER TABLE users
DROP COLUMN IF EXISTS role,
DROP COLUMN IF EXISTS business_id;

ALTER TABLE businesses
ADD COLUMN logo TEXT,
ADD COLUMN employee_count SMALLINT CHECK (employee_count >= 0),
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
);

-- +migrate Down

ALTER TABLE businesses
DROP COLUMN IF EXISTS logo,
DROP COLUMN IF EXISTS employee_count,
DROP COLUMN IF EXISTS category;

ALTER TABLE users
ADD COLUMN business_id UUID REFERENCES businesses(id) ON DELETE SET NULL,
ADD COLUMN role USER_ROLE;

DROP INDEX IF EXISTS uniq_roles_user_business_role;
DROP TABLE IF EXISTS roles;
