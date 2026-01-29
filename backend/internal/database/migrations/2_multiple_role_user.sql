-- +migrate Up

CREATE TABLE roles (
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role USER_ROLE NOT NULL,
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  pin_hash TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT roles_pk PRIMARY KEY (user_id, business_id),

  CONSTRAINT not_null_business_id_and_pin_hash CHECK (
    (business_id IS NOT NULL AND role != 'superadmin')
    AND
    (pin_hash IS NOT NULL AND role != 'superadmin')
  )
);


-- Seed roles
INSERT INTO roles (user_id, business_id, role, pin_hash)
SELECT id, business_id, role, ''
FROM users;

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
  ),
  ADD COLUMN code TEXT NOT NULL UNIQUE
  DEFAULT upper(substr(gen_random_uuid()::text, 1, 6));
);

-- +migrate Down

ALTER TABLE businesses
DROP COLUMN IF EXISTS logo,
DROP COLUMN IF EXISTS employee_count,
DROP COLUMN IF EXISTS category;

ALTER TABLE users
ADD COLUMN business_id UUID REFERENCES businesses(id) ON DELETE SET NULL,
ADD COLUMN role USER_ROLE;

-- Seed roles
UPDATE users
SET business_id = roles.business_id,
    role = roles.role
FROM roles
WHERE users.id = roles.user_id;

DROP INDEX IF EXISTS uniq_roles_user_business_role;
DROP TABLE IF EXISTS roles;
