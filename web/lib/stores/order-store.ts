import { create } from "zustand";
import { Product } from "@/services/api-product";

export type OrderItem = {
  product: Product;
  quantity: number;
  subtotal: number;
};

type OrderStore = {
  items: OrderItem[];
  selectedCategoryId: string | null;

  // Actions
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearItems: () => void;
  setSelectedCategory: (categoryId: string | null) => void;

  // Computed
  getTotal: () => number;
  getItemCount: () => number;
};

export const useOrderStore = create<OrderStore>((set, get) => ({
  items: [],
  selectedCategoryId: null,

  addItem: (product) => {
    const { items } = get();
    const existingItem = items.find((item) => item.product.id === product.id);

    if (existingItem) {
      set({
        items: items.map((item) =>
          item.product.id === product.id
            ? {
                ...item,
                quantity: item.quantity + 1,
                subtotal: (item.quantity + 1) * product.price,
              }
            : item
        ),
      });
    } else {
      set({
        items: [
          ...items,
          {
            product,
            quantity: 1,
            subtotal: product.price,
          },
        ],
      });
    }
  },

  removeItem: (productId) => {
    set((state) => ({
      items: state.items.filter((item) => item.product.id !== productId),
    }));
  },

  updateQuantity: (productId, quantity) => {
    if (quantity <= 0) {
      get().removeItem(productId);
      return;
    }

    set((state) => ({
      items: state.items.map((item) =>
        item.product.id === productId
          ? {
              ...item,
              quantity,
              subtotal: quantity * item.product.price,
            }
          : item
      ),
    }));
  },

  clearItems: () => {
    set({ items: [] });
  },

  setSelectedCategory: (categoryId) => {
    set({ selectedCategoryId: categoryId });
  },

  getTotal: () => {
    return get().items.reduce((total, item) => total + item.subtotal, 0);
  },

  getItemCount: () => {
    return get().items.reduce((count, item) => count + item.quantity, 0);
  },
}));
