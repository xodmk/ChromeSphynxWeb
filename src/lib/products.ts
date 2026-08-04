// Website product catalog. `productId` on each entry matches the licensing
// catalog in src/lib/licensing/products.ts — that file stays authoritative for
// license issuance; this one carries the marketing content.

import blockRotator from '../content/plugins/block-rotator.json';
import poltergeist from '../content/plugins/poltergeist.json';

export interface Product {
  slug: string;
  productId: string;
  name: string;
  tagline: string;
  summary: string;
  price: string;
  currency: string;
  image: string;
  gallery: string[];
  video?: string;
  highlights: { title: string; body: string }[];
  specs: string[][];
  formats: string[];
  requirements: string[];
  audience: string;
}

export const PRODUCTS: Product[] = [blockRotator, poltergeist];

export function getProduct(slug: string): Product | undefined {
  return PRODUCTS.find((p) => p.slug === slug);
}
