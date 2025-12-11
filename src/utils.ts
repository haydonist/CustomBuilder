import type { MoneyV2, Product } from "./api/index.ts";

export function formatMoney(m: MoneyV2): string {
  const value = Number.parseFloat(m.amount);
  if (Number.isNaN(value)) return `${m.currencyCode} ${m.amount}`;

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: m.currencyCode,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

// filter products by belt base compatibility
declare global {
  interface Array<T> {
    compatible(this: Array<Product>, beltBase: Product | null): Product[];
  }
}

if (!Array.prototype.compatible) {
 Object.defineProperty(Array.prototype, 'compatible', {
    value: function(this: Product[], beltBase: Product | null): Product[] {
      const baseWidth = beltBase?.tags?.find((t) => t.endsWith("mm"));
      // Use the built-in filter method to return a new array 
      // containing only compatible products.
      if(!baseWidth) return this;

    return this.filter(p => p.tags.includes(baseWidth));
    },
    enumerable: false,
    writable: true,
    configurable: true
  });
}
