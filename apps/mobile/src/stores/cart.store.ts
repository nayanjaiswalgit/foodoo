import { create } from 'zustand';

interface CartItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  variant?: string;
  addons: string[];
  addonPrices: number[];
  image?: string;
}

/** Unique key for a cart item based on menuItemId + variant + addons */
const cartItemKey = (item: { menuItemId: string; variant?: string; addons: string[] }): string =>
  `${item.menuItemId}|${item.variant ?? ''}|${[...item.addons].sort().join(',')}`;

interface CartState {
  restaurantId: string | null;
  restaurantName: string | null;
  items: CartItem[];
  addItem: (restaurantId: string, restaurantName: string, item: CartItem) => boolean;
  removeItem: (menuItemId: string, variant?: string, addons?: string[]) => void;
  updateQuantity: (menuItemId: string, quantity: number, variant?: string, addons?: string[]) => void;
  clearCart: () => void;
  getSubtotal: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  restaurantId: null,
  restaurantName: null,
  items: [],

  addItem: (restaurantId, restaurantName, item) => {
    const state = get();

    // Different restaurant check
    if (state.restaurantId && state.restaurantId !== restaurantId) {
      return false; // Signal caller to show confirmation
    }

    const newKey = cartItemKey(item);
    const existingIndex = state.items.findIndex((i) => cartItemKey(i) === newKey);

    if (existingIndex >= 0) {
      const updated = [...state.items];
      const existing = updated[existingIndex]!;
      updated[existingIndex] = { ...existing, quantity: existing.quantity + item.quantity };
      set({ items: updated });
    } else {
      set({
        restaurantId,
        restaurantName,
        items: [...state.items, item],
      });
    }
    return true;
  },

  removeItem: (menuItemId, variant, addons) => {
    const key = cartItemKey({ menuItemId, variant, addons: addons ?? [] });
    const items = get().items.filter((i) => cartItemKey(i) !== key);
    if (items.length === 0) {
      set({ items: [], restaurantId: null, restaurantName: null });
    } else {
      set({ items });
    }
  },

  updateQuantity: (menuItemId, quantity, variant, addons) => {
    if (quantity <= 0) {
      get().removeItem(menuItemId, variant, addons);
      return;
    }
    const key = cartItemKey({ menuItemId, variant, addons: addons ?? [] });
    set({
      items: get().items.map((i) =>
        cartItemKey(i) === key ? { ...i, quantity } : i
      ),
    });
  },

  clearCart: () => set({ items: [], restaurantId: null, restaurantName: null }),

  getSubtotal: () => {
    return get().items.reduce((sum, item) => {
      const addonTotal = item.addonPrices.reduce((a, b) => a + b, 0);
      return sum + (item.price + addonTotal) * item.quantity;
    }, 0);
  },

  getItemCount: () => {
    return get().items.reduce((sum, item) => sum + item.quantity, 0);
  },
}));
