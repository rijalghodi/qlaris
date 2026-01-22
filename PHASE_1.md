Below is a **solo-developer, execution-ready TODO list** for **Goal 1**.
Ordered to **ship fast**, not perfect.

---

# Goal 1 — Sell immediately, no training

## 0️⃣ Project setup (do first)

- [x] Create monorepo (FE + BE)
- [x] Setup database (Postgres)
- [x] Env config (.env)
- [x] Basic auth middleware (owner vs staff)

---

## 1️⃣ Account (minimal)

### Backend

- [x] User table
- [x] Auth API
  - [x] Register
  - [x] Login
  - [x] Forgot password
  - [x] Reset password
  - [x] Login by Google
- [x] Session/token handling

### Frontend

- [x] Login UI
- [x] Register UI
- [x] Forgot password UI
- [x] Reset password UI
- [x] Google login UI
- [x] Logout UI
- [x] Protect routes

---

## 2️⃣ Catalog (must be dead simple)

### Backend

- [x] Product table (name, price, image, stock_qty)
- [x] CRUD product endpoints:
  - [x] create product
  - [x] update product
  - [x] list products (active only)
  - [x] delete product
  - [x] toggle product status (is_active)

### Frontend

- [x] Product list screen
- [x] Add product form
- [x] Edit product form
- [x] Optional image upload
- [x] Stock input field

❌ No SKU
❌ No category
❌ No barcode

---

## 3️⃣ Checkout (core POS)

### Backend

- [x] Init transaction table
- [x] Create endpoint to transaction:
  - [x] Create-transaction endpoint on checkout
    - transaction_items as ids
    - expiredAt is now() + 15 minutes
    - decrease stock on checkout
  - [x] Edit-transaction endpoint

### Frontend

- [x] Product grid/list
- [x] Add item to cart
- [x] Increase/decrease quantity
- [x] Remove item
- [x] Show subtotal per item
- [x] Show total
- [x] Checkout button

---

## 4️⃣ Payment (cash only)

### Backend

- [x] Cash payment confirmation endpoint
- [x] Optional: input received cash
- [x] Calculate change (optional)
- [x] Finalize transaction

### Frontend

- [x] Receipt screen (after checkout)
- [ ] Print-friendly receipt layout
- [x] “Done / New sale” button

❌ No QRIS
❌ No split payment

---

## 5️⃣ Transaction & Receipt

---

## 6️⃣ Basic Report (today only)

- [x] Fetch today total sales
- [x] Fetch today transaction count
- [x] Simple dashboard card:
  - Total sales today
  - Total transactions today
  - Total profit today
  - Total sales this week
  - Total profit this week
  - Total sales this month
  - Top products
  - Last transactions

❌ No date range
❌ No export

---

## 7️⃣ UX polish (only essentials)

- [ ] Fast loading on POS screen
- [ ] Big buttons (touch friendly)
- [ ] Error handling (out of stock)
- [ ] Loading states

---

## 8️⃣ Final sanity check

- [ ] Can add product in < 30 seconds
- [ ] Can sell item in < 3 taps
- [ ] No screen requires explanation
- [ ] Works on low-spec device

---

## What you MUST NOT build now

- Roles & permissions
- Tax
- Discounts
- Variants
- Barcode
- QRIS
- Customer management

---

## One rule while coding

> **If a feature delays checkout → skip it.**

This TODO list is **exactly enough** to onboard a real UMKM and let them sell on day one.
