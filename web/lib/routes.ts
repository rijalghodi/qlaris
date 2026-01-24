export const ROUTES = {
  // Auth
  LOGIN: "/login",
  REGISTER: "/register",
  FORGOT_PASSWORD: "/forgot-password",
  RESET_PASSWORD: "/reset-password",
  SET_PASSWORD: "/set-password",
  SEND_VERIFICATION: "/send-verification",
  GOOGLE_SUCCESS: "/google-success",

  // Landing
  LANDING: "/",

  // Dashboard
  DASHBOARD: "/dashboard",
  MY_ACCOUNT: "/account",

  // Products
  PRODUCTS: "/products",
  PRODUCT_ADD: "/products/add",
  PRODUCT_EDIT: (productId: string) => `/products/${productId}/edit`,

  // Categories
  CATEGORIES: "/categories",

  // Transactions
  TRANSACTIONS: "/transactions",
  TRANSACTION_DETAIL: (transactionId: string) => `/transactions/${transactionId}`,
  NEW_TRANSACTION: "/transactions/new",
  TRANSACTION_SUCCESS: (transactionId: string) => `/transactions/${transactionId}/success`,
};
