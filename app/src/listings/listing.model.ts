/** Зарын төрөл: түрээс эсвэл худалдаа (Лаб 5-ын RentListing / SaleListing). */
export type ListingType = 'rent' | 'sale';

export interface Listing {
  id: number;
  title: string;
  type: ListingType;
  /** Дүүрэг, жишээ нь "Баянзүрх". */
  district: string;
  /** Түрээс бол сарын төлбөр, худалдаа бол нийт үнэ (төгрөгөөр). */
  price: number;
  /** Талбай, м². */
  area: number;
  rooms: number;
  /** Идэвхгүй болгосон зар хайлтад гарахгүй (US-04). */
  active: boolean;
}

/** US-01: үнэ болон байршлаар шүүх шалгуур. Бүх талбар заавал биш. */
export interface ListingFilter {
  district?: string;
  type?: ListingType;
  minPrice?: number;
  maxPrice?: number;
}
