import { create } from 'zustand';

interface CartItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  variant?: string;
  addons: string[];
  image?: string;
}

interface CartState {
  restaurantId: string | null;
  restaurantName: string | null;
  items: CartItem[];
  addItem: (restaurantId: string, restaurantName: string, item: CartItem) => boolean;
  removeItem: (menuItemId: string) => void;
  updateQuantity: (menuItemId: string, quantity: number) => void;
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

    const existing = state.items.find(
      (i) =>
        i.menuItemId === item.menuItemId &&
        i.variant === item.variant &&
        JSON.stringify(i.addons) === JSON.stringify(item.addons)
    );

    if (existing) {
      set({
        items: state.items.map((i) =>
          i === existing ? { ...i, quantity: i.quantity + item.quantity } : i
        ),
      });
    } else {
      set({
        restaurantId,
        restaurantName,
        items: [...state.items, item],
      });
    }
    return true;
  },

  removeItem: (menuItemId) => {
    const items = get().items.filter((i) => i.menuItemId !== menuItemId);
    if (items.length === 0) {
      set({ items: [], restaurantId: null, restaurantName: null });
    } else {
      set({ items });
    }
  },

  updateQuantity: (menuItemId, quantity) => {
    if (quantity <= 0) {
      get().removeItem(menuItemId);
      return;
    }
    set({
      items: get().items.map((i) =>
        i.menuItemId === menuItemId ? { ...i, quantity } : i
      ),
    });
  },

  clearCart: () => set({ items: [], restaurantId: null, restaurantName: null }),

  getSubtotal: () => {
    return get().items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  },

  getItemCount: () => {
    return get().items.reduce((sum, item) => sum + item.quantity, 0);
  },
}));
