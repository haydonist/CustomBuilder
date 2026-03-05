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

/** Normalized concho thumbnail scale: 25mm is the reference at scale 5. */
export function getConchoThumbScale(product: Product): number | undefined {
  const BASE_SCALE = 5;
  const REF_MM = 25;
  const tag = product.tags?.find((t) => t.toLowerCase().endsWith("mm"));
  if (!tag) return undefined;
  const mm = parseFloat(tag);
  if (!mm || mm <= 0) return undefined;
  return BASE_SCALE * (REF_MM / mm);
}