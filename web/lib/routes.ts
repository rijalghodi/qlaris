export const ROUTES = {
  // Auth
  LOGIN: "/login",
  REGISTER: "/register",
  FORGOT_PASSWORD: "/forgot-password",
  RESET_PASSWORD: "/reset-password",
  SET_PASSWORD: "/set-password",
  SEND_VERIFICATION: "/send-verification",
  GOOGLE_SUCCESS: "/google-success",

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

  // New Order
  NEW_ORDER: "/order",
};
