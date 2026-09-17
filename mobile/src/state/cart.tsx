import React, { createContext, useContext, useMemo, useState } from 'react';
import { corridorById, productById, type Product } from '@/data/mockData';

export interface CartLine {
  productId: string;
  quantity: number;
}

interface CartState {
  lines: CartLine[];
  add: (productId: string) => void;
  remove: (productId: string) => void;
  clear: () => void;
  count: number;
  /** Grouped by seller, with per-product delivery, mirroring the multi-seller/split model. */
  productSubtotalPence: number;
  deliveryPence: number;
  totalPence: number;
}

const CartContext = createContext<CartState | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);

  function add(productId: string) {
    setLines((prev) => {
      const existing = prev.find((l) => l.productId === productId);
      if (existing) return prev.map((l) => (l.productId === productId ? { ...l, quantity: l.quantity + 1 } : l));
      return [...prev, { productId, quantity: 1 }];
    });
  }
  function remove(productId: string) {
    setLines((prev) => prev.filter((l) => l.productId !== productId));
  }
  function clear() {
    setLines([]);
  }

  const value = useMemo<CartState>(() => {
    const resolved = lines
      .map((l) => ({ product: productById(l.productId), quantity: l.quantity }))
      .filter((x): x is { product: Product; quantity: number } => Boolean(x.product));

    const productSubtotalPence = resolved.reduce((sum, x) => sum + x.product.pricePence * x.quantity, 0);
    // Delivery: one charge per corridor used (consolidation); uk_direct flat 399.
    const corridorPrices = new Map<string, number>();
    let ukDirect = 0;
    for (const { product } of resolved) {
      if (product.fulfilment === 'uk_direct') ukDirect = 399;
      else {
        const c = corridorById(product.corridorId);
        if (c) corridorPrices.set(c.id, c.pricePence);
      }
    }
    const deliveryPence = ukDirect + Array.from(corridorPrices.values()).reduce((a, b) => a + b, 0);

    return {
      lines,
      add,
      remove,
      clear,
      count: resolved.reduce((n, x) => n + x.quantity, 0),
      productSubtotalPence,
      deliveryPence,
      totalPence: productSubtotalPence + deliveryPence,
    };
  }, [lines]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartState {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
