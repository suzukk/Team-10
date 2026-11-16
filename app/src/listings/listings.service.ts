import { Injectable } from '@nestjs/common';
import type { Listing, ListingFilter } from './listing.model.js';
import { ListingsRepository } from './listings.repository.js';

export class InvalidFilterError extends Error {}

/**
 * US-01: зарыг үнэ, байршил, төрлөөр шүүнэ.
 * - Идэвхгүй зар хэзээ ч гарахгүй.
 * - Дүүргийн нэрийг том/жижиг үсэг, илүү зай харгалзахгүй тулгана.
 * - Үр дүнг үнийн өсөх дарааллаар буцаана.
 */
export function filterListings(listings: Listing[], filter: ListingFilter = {}): Listing[] {
  const { district, type, minPrice, maxPrice } = filter;

  for (const [name, value] of [['minPrice', minPrice], ['maxPrice', maxPrice]] as const) {
    if (value !== undefined && (!Number.isFinite(value) || value < 0)) {
      throw new InvalidFilterError(`${name} нь 0 буюу түүнээс их тоо байх ёстой`);
    }
  }
  if (minPrice !== undefined && maxPrice !== undefined && minPrice > maxPrice) {
    throw new InvalidFilterError('minPrice нь maxPrice-ээс их байж болохгүй');
  }

  const wantedDistrict = district?.trim().toLowerCase();

  return listings
    .filter((listing) => listing.active)
    .filter((listing) => !wantedDistrict || listing.district.toLowerCase() === wantedDistrict)
    .filter((listing) => !type || listing.type === type)
    .filter((listing) => minPrice === undefined || listing.price >= minPrice)
    .filter((listing) => maxPrice === undefined || listing.price <= maxPrice)
    .sort((a, b) => a.price - b.price);
}

/** Business давхарга. */
@Injectable()
export class ListingsService {
  constructor(private readonly repository: ListingsRepository) {}

  async search(filter: ListingFilter = {}): Promise<Listing[]> {
    const listings = await this.repository.findAll();
    return filterListings(listings, filter);
  }

  async findActiveById(id: number): Promise<Listing | undefined> {
    const listing = await this.repository.findById(id);
    return listing?.active ? listing : undefined;
  }
}
