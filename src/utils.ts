import type { MoneyV2, Product } from "./api/index.js";

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
