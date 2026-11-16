import { Injectable } from '@nestjs/common';
import type { Listing } from './listing.model.js';

const SEED_LISTINGS: Listing[] = [
  { id: 1, title: 'Зайсанд 2 өрөө байр', type: 'rent', district: 'Хан-Уул', price: 2_500_000, area: 62, rooms: 2, active: true },
  { id: 2, title: '13-р хороололд 1 өрөө байр', type: 'rent', district: 'Баянзүрх', price: 1_200_000, area: 34, rooms: 1, active: true },
  { id: 3, title: 'Их сургуулийн ойролцоо оюутны байр', type: 'rent', district: 'Сүхбаатар', price: 900_000, area: 28, rooms: 1, active: true },
  { id: 4, title: 'Яармагт шинэ 3 өрөө байр', type: 'sale', district: 'Хан-Уул', price: 320_000_000, area: 86, rooms: 3, active: true },
  { id: 5, title: '3, 4-р хороололд 2 өрөө байр', type: 'sale', district: 'Баянгол', price: 185_000_000, area: 48, rooms: 2, active: true },
  { id: 6, title: 'Төв талбайн ойролцоо оффис', type: 'rent', district: 'Чингэлтэй', price: 4_000_000, area: 95, rooms: 4, active: true },
  { id: 7, title: 'Сансарт 2 өрөө байр', type: 'rent', district: 'Баянзүрх', price: 1_800_000, area: 50, rooms: 2, active: true },
  { id: 8, title: 'Толгойтод хашаа байшин', type: 'sale', district: 'Сонгинохайрхан', price: 95_000_000, area: 70, rooms: 3, active: false },
];

/**
 * Data давхарга. Одоогоор санах ойд хадгална; дараа нь Prisma + PostgreSQL-ээр
 * солиход service давхарга өөрчлөгдөхгүй байхаар async интерфэйстэй.
 */
@Injectable()
export class ListingsRepository {
  findAll(): Promise<Listing[]> {
    return Promise.resolve(SEED_LISTINGS.map((listing) => ({ ...listing })));
  }

  findById(id: number): Promise<Listing | undefined> {
    const listing = SEED_LISTINGS.find((item) => item.id === id);
    return Promise.resolve(listing ? { ...listing } : undefined);
  }
}
