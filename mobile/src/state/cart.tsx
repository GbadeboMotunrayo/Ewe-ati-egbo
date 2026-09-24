import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { productById, quoteDelivery, type Product } from '@/data/mockData';

export const MAX_QTY_PER_LINE = 20;

export interface CartLine {
  productId: string;
  quantity: number;
}

export interface ResolvedLine {
  product: Product;
  quantity: number;
  linePence: number;
}

interface CartState {
  lines: CartLine[];
  /** Lines whose product still exists — use this for rendering, not `lines`. */
  items: ResolvedLine[];
  add: (productId: string, quantity?: number) => boolean;
  increment: (productId: string) => void;
  decrement: (productId: string) => void;
  remove: (productId: string) => void;
  clear: () => void;
  quantityOf: (productId: string) => number;
  count: number;
  productSubtotalPence: number;
  deliveryPence: number;
  totalPence: number;
  /** Products that can't be priced for delivery — checkout must be blocked while any exist. */
  undeliverable: Product[];
}

const CartContext = createContext<CartState | undefined>(undefined);

/**
 * PRICING HERE IS A DISPLAY ESTIMATE ONLY. The server must recompute every total
 * from product/route IDs before charging — never trust a client-sent amount.
 */
export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);

  const add = useCallback((productId: string, quantity = 1) => {
    const product = productById(productId);
    if (!product || !quoteDelivery(product)) return false; // unknown or undeliverable: refuse
    setLines((prev) => {
      const existing = prev.find((l) => l.productId === productId);
      if (existing) {
        return prev.map((l) => (l.productId === productId ? { ...l, quantity: Math.min(MAX_QTY_PER_LINE, l.quantity + quantity) } : l));
      }
      return [...prev, { productId, quantity: Math.min(MAX_QTY_PER_LINE, quantity) }];
    });
    return true;
  }, []);

  const increment = useCallback((productId: string) => {
    setLines((prev) => prev.map((l) => (l.productId === productId ? { ...l, quantity: Math.min(MAX_QTY_PER_LINE, l.quantity + 1) } : l)));
  }, []);

  const decrement = useCallback((productId: string) => {
    setLines((prev) =>
      prev.flatMap((l) => {
        if (l.productId !== productId) return [l];
        return l.quantity <= 1 ? [] : [{ ...l, quantity: l.quantity - 1 }];
      })
    );
  }, []);

  const remove = useCallback((productId: string) => setLines((prev) => prev.filter((l) => l.productId !== productId)), []);
  const clear = useCallback(() => setLines([]), []);

  const value = useMemo<CartState>(() => {
    const items: ResolvedLine[] = [];
    for (const l of lines) {
      const product = productById(l.productId);
      if (product) items.push({ product, quantity: l.quantity, linePence: product.pricePence * l.quantity });
    }

    const productSubtotalPence = items.reduce((sum, x) => sum + x.linePence, 0);

    // Delivery: one charge per corridor used (consolidation); UK-direct is one flat charge.
    const charges = new Map<string, number>();
    const undeliverable: Product[] = [];
    for (const { product } of items) {
      const q = quoteDelivery(product);
      if (!q) undeliverable.push(product);
      else charges.set(q.direct ? 'uk_direct' : q.corridorId!, q.pricePence);
    }
    const deliveryPence = Array.from(charges.values()).reduce((a, b) => a + b, 0);

    return {
      lines,
      items,
      add,
      increment,
      decrement,
      remove,
      clear,
      quantityOf: (id: string) => lines.find((l) => l.productId === id)?.quantity ?? 0,
      count: items.reduce((n, x) => n + x.quantity, 0),
      productSubtotalPence,
      deliveryPence,
      totalPence: productSubtotalPence + deliveryPence,
      undeliverable,
    };
  }, [lines, add, increment, decrement, remove, clear]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartState {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
