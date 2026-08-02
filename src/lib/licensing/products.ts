// Product catalog for licensing. Shared by server code and client pages —
// keep this file free of Node-only imports.

export const PRODUCTS = [
  { id: 'block-rotator', name: 'Block Rotator' },
  { id: 'poltergeist', name: 'Poltergeist' },
] as const;

export type ProductId = (typeof PRODUCTS)[number]['id'];

export function isProductId(value: string): value is ProductId {
  return PRODUCTS.some((p) => p.id === value);
}
