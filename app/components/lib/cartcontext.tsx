"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
  useState,
} from "react";

import { getProductById } from "./products";

export type CartItem = {
  productId: number;
  quantity: number;
};

type CartContextValue = {
  items: CartItem[];
  count: number;
  drawerOpen: boolean;
  addItem: (productId: number, quantity?: number, openDrawer?: boolean) => void;
  removeItem: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  openDrawer: () => void;
  closeDrawer: () => void;
  subtotal: number;
  deliveryFee: number;
  total: number;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "nxteraa-cart";
const STORAGE_EVENT = "nxteraa-cart-change";

// Cached server snapshot to avoid infinite loop in useSyncExternalStore
const EMPTY_CART: CartItem[] = [];

// Cache for the last read value to ensure stable references
let cachedItems: CartItem[] | undefined = undefined;
let cachedString: string | undefined = undefined;

function readStoredItems(): CartItem[] {
  if (typeof window === "undefined") {
    return EMPTY_CART;
  }

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    const newString = stored ?? "";
    
    // Return cached value if nothing changed
    if (cachedString !== undefined && cachedString === newString) {
      return cachedItems as CartItem[];
    }
    
    // Update cache and return new value
    cachedString = newString;
    cachedItems = stored ? (JSON.parse(stored) as CartItem[]) : EMPTY_CART;
    return cachedItems as CartItem[];
  } catch {
    return EMPTY_CART;
  }
}

function writeStoredItems(items: CartItem[]) {
  if (typeof window === "undefined") {
    return;
  }

  // Invalidate cache before writing
  cachedString = undefined;
  cachedItems = undefined;
  
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event(STORAGE_EVENT));
}

function updateStoredItems(updater: (current: CartItem[]) => CartItem[]) {
  const nextItems = updater(readStoredItems());
  writeStoredItems(nextItems);
}

function subscribeToStoredItems(onStoreChange: () => void) {
  if (typeof window === "undefined") {
    return () => {};
  }

  const handleChange = () => {
    // Invalidate cache when storage changes
    cachedString = undefined;
    cachedItems = undefined;
    onStoreChange();
  };
  window.addEventListener("storage", handleChange);
  window.addEventListener(STORAGE_EVENT, handleChange);

  return () => {
    window.removeEventListener("storage", handleChange);
    window.removeEventListener(STORAGE_EVENT, handleChange);
  };
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const items = useSyncExternalStore(
    subscribeToStoredItems,
    readStoredItems,
    () => EMPTY_CART,
  );
  const [drawerOpen, setDrawerOpen] = useState(false);

  const openDrawer = useCallback(() => setDrawerOpen(true), []);
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);

  const addItem = useCallback(
    (productId: number, quantity = 1, shouldOpenDrawer = true) => {
      updateStoredItems((current) => {
        const existing = current.find((item) => item.productId === productId);
        if (existing) {
          return current.map((item) =>
            item.productId === productId
              ? { ...item, quantity: Math.min(9, item.quantity + quantity) }
              : item,
          );
        }
        return [...current, { productId, quantity }];
      });
      if (shouldOpenDrawer) setDrawerOpen(true);
    },
    [],
  );

  const removeItem = useCallback((productId: number) => {
    updateStoredItems((current) =>
      current.filter((item) => item.productId !== productId),
    );
  }, []);

  const updateQuantity = useCallback((productId: number, quantity: number) => {
    if (quantity < 1) {
      updateStoredItems((current) =>
        current.filter((item) => item.productId !== productId),
      );
      return;
    }
    updateStoredItems((current) =>
      current.map((item) =>
        item.productId === productId
          ? { ...item, quantity: Math.min(9, quantity) }
          : item,
      ),
    );
  }, []);

  const clearCart = useCallback(() => writeStoredItems([]), []);

  const count = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items],
  );

  const subtotal = useMemo(
    () =>
      items.reduce((sum, item) => {
        const product = getProductById(item.productId);
        return sum + product.price * item.quantity;
      }, 0),
    [items],
  );

  const deliveryFee = subtotal >= 999 || subtotal === 0 ? 0 : 79;
  const total = subtotal + deliveryFee;

  const value = useMemo(
    () => ({
      items,
      count,
      drawerOpen,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      openDrawer,
      closeDrawer,
      subtotal,
      deliveryFee,
      total,
    }),
    [
      items,
      count,
      drawerOpen,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      openDrawer,
      closeDrawer,
      subtotal,
      deliveryFee,
      total,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
}
