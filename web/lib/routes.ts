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

  // Products
  PRODUCTS: "/products",
  PRODUCT_ADD: "/products/add",
  PRODUCT_EDIT: (productId: string) => `/products/${productId}/edit`,

  // Categories
  CATEGORIES: "/categories",

  // Transactions
  TRANSACTIONS: "/transactions",
  TRANSACTION_DETAIL: (transactionId: string) => `/transactions/${transactionId}`,

  // New Order
  NEW_ORDER: "/order",
  ORDER_SUCCESS: (transactionId: string) => `/order/success/${transactionId}`,
};
