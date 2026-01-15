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
- [x] CRUD product endpoints:
  - [x] create product
  - [x] update product
  - [x] list products (active only)
  - [x] delete product
  - [x] toggle product status (is_active)

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

- [x] Init transaction table
- [x] Create endpoint to transaction:
  - [x] Create-transaction endpoint on checkout
    - transaction_items as ids
    - expiredAt is now() + 15 minutes
    - decrease stock on checkout
  - [x] Edit-transaction endpoint

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

### Backend

- [x] Cash payment confirmation endpoint
- [x] Optional: input received cash
- [x] Calculate change (optional)
- [x] Finalize transaction

### Frontend

- [ ] Receipt screen (after checkout)
- [ ] Print-friendly receipt layout
- [ ] “Done / New sale” button

❌ No QRIS
❌ No split payment

---

## 5️⃣ Transaction & Receipt

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
