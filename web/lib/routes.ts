export const ROUTES = {
  // Auth
  LOGIN: "/login",
  SEND_VERIFICATION: "/send-verification",
  GOOGLE_SUCCESS: "/google-success",

  // Dashboard
  DASHBOARD: "/dashboard",

  // Products
  PRODUCTS: "/products",
  PRODUCT_ADD: "/products/add",
  PRODUCT_EDIT: (productId: string) => `/products/${productId}/edit`,

  // Transactions
  TRANSACTIONS: "/transactions",
};
