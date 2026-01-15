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

- [ ] Login UI
- [ ] Register UI
- [ ] Forgot password UI
- [ ] Reset password UI
- [ ] Google login UI
- [ ] Logout UI
- [ ] Protect routes

---

## 2️⃣ Catalog (must be dead simple)

### Backend

- [x] Product table (name, price, image, stock_qty)
- [ ] CRUD APIs:
  - [ ] create product
  - [ ] update product
  - [ ] list products (active only)
  - [ ] delete product

### Frontend

- [ ] Product list screen
- [ ] Add product form
- [ ] Edit product form
- [ ] Optional image upload
- [ ] Stock input field

❌ No SKU
❌ No category
❌ No barcode

---

## 3️⃣ Checkout (core POS)

### Backend

- [ ] Create transaction API
- [ ] Decrease stock on checkout
- [ ] Transaction items save

### Frontend

- [ ] Product grid/list
- [ ] Add item to cart
- [ ] Increase/decrease quantity
- [ ] Remove item
- [ ] Show subtotal per item
- [ ] Show total
- [ ] Checkout button

---

## 4️⃣ Payment (cash only)

- [ ] Cash payment confirmation modal
- [ ] Optional: input received cash
- [ ] Calculate change (optional)
- [ ] Finalize transaction

❌ No QRIS
❌ No split payment

---

## 5️⃣ Transaction & Receipt

### Backend

- [ ] Transaction table
- [ ] Transaction items table
- [ ] List today transactions
- [ ] Aggregate total sales today
- [ ] Count total transactions today

### Frontend

- [ ] Receipt screen (after checkout)
- [ ] Print-friendly receipt layout
- [ ] “Done / New sale” button

---

## 6️⃣ Basic Report (today only)

- [ ] Fetch today total sales
- [ ] Fetch today transaction count
- [ ] Simple dashboard card:

  - Total sales today
  - Total transactions today

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
