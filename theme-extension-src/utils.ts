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

export function assert(condition: unknown, message?: string): asserts condition {
  if (!condition) {
    throw new Error(message ?? "Assertion failed");
  }
}

export function assertInstanceOf<T extends abstract new (...args: any) => any>(
  value: unknown,
  ctor: T,
  message?: string,
): asserts value is InstanceType<T> {
  if (!(value instanceof ctor)) {
    throw new Error(message ?? `Expected value to be instance of ${ctor.name}`);
  }
}

export const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));