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

const EMPTY_CART = Object.freeze([]) as unknown as CartItem[];

let cachedItems: CartItem[] = EMPTY_CART;
let cachedString = "";

function getServerCartSnapshot() {
  return EMPTY_CART;
}

function parseStoredItems(stored: string | null) {
  if (!stored) {
    return EMPTY_CART;
  }

  try {
    const parsed = JSON.parse(stored) as unknown;
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return EMPTY_CART;
    }

    const items = parsed.filter(
      (item): item is CartItem =>
        Boolean(item) &&
        typeof item === "object" &&
        typeof (item as CartItem).productId === "number" &&
        typeof (item as CartItem).quantity === "number" &&
        (item as CartItem).quantity > 0,
    );

    return items.length > 0 ? items : EMPTY_CART;
  } catch {
    return EMPTY_CART;
  }
}

function readStoredItems(): CartItem[] {
  if (typeof window === "undefined") {
    return getServerCartSnapshot();
  }

  const stored = window.localStorage.getItem(STORAGE_KEY) ?? "";
  if (cachedString === stored) {
    return cachedItems;
  }

  cachedString = stored;
  cachedItems = parseStoredItems(stored);
  return cachedItems;
}

function writeStoredItems(items: CartItem[]) {
  if (typeof window === "undefined") {
    return;
  }

  const nextItems = items.length > 0 ? items : EMPTY_CART;
  const serialized = nextItems === EMPTY_CART ? "" : JSON.stringify(nextItems);

  cachedItems = nextItems;
  cachedString = serialized;

  if (serialized) {
    window.localStorage.setItem(STORAGE_KEY, serialized);
  } else {
    window.localStorage.removeItem(STORAGE_KEY);
  }
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
    cachedString = "";
    cachedItems = getServerCartSnapshot();
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
    getServerCartSnapshot,
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
