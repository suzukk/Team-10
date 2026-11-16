import { BadRequestException, Controller, Get, NotFoundException, Param, ParseIntPipe, Query } from '@nestjs/common';
import type { Listing, ListingFilter, ListingType } from './listing.model.js';
import { InvalidFilterError, ListingsService } from './listings.service.js';

function parsePrice(name: string, raw?: string): number | undefined {
  if (raw === undefined || raw.trim() === '') {
    return undefined;
  }
  const value = Number(raw);
  if (Number.isNaN(value)) {
    throw new BadRequestException(`${name} нь тоо байх ёстой`);
  }
  return value;
}

function parseType(raw?: string): ListingType | undefined {
  if (raw === undefined || raw === '') {
    return undefined;
  }
  if (raw !== 'rent' && raw !== 'sale') {
    throw new BadRequestException('type нь "rent" эсвэл "sale" байх ёстой');
  }
  return raw;
}

@Controller('listings')
export class ListingsController {
  constructor(private readonly listingsService: ListingsService) {}

  @Get()
  async search(
    @Query('district') district?: string,
    @Query('type') type?: string,
    @Query('minPrice') minPrice?: string,
    @Query('maxPrice') maxPrice?: string,
  ): Promise<{ count: number; items: Listing[] }> {
    const filter: ListingFilter = {
      district: district || undefined,
      type: parseType(type),
      minPrice: parsePrice('minPrice', minPrice),
      maxPrice: parsePrice('maxPrice', maxPrice),
    };

    try {
      const items = await this.listingsService.search(filter);
      return { count: items.length, items };
    } catch (error) {
      if (error instanceof InvalidFilterError) {
        throw new BadRequestException(error.message);
      }
      throw error;
    }
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Listing> {
    const listing = await this.listingsService.findActiveById(id);
    if (!listing) {
      throw new NotFoundException(`${id} дугаартай идэвхтэй зар олдсонгүй`);
    }
    return listing;
  }
}
