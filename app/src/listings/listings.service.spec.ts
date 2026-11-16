import { describe, expect, it, jest } from '@jest/globals';
import type { Listing } from './listing.model.js';
import type { ListingsRepository } from './listings.repository.js';
import { filterListings, InvalidFilterError, ListingsService } from './listings.service.js';

/** Тестийн жишиг зар үүсгэгч: зөвхөн тухайн тестэд чухал талбарыг зааж өгнө. */
function listing(overrides: Partial<Listing>): Listing {
  return {
    id: 1,
    title: 'Жишиг зар',
    type: 'rent',
    district: 'Баянзүрх',
    price: 1_000_000,
    area: 40,
    rooms: 2,
    active: true,
    ...overrides,
  };
}

describe('filterListings — зарыг үнэ, байршлаар шүүх (US-01)', () => {
  // ---------- Хэвийн тохиолдол ----------

  it('дүүрэг болон дээд үнээр шүүж, тохирох зарыг л буцаана', () => {
    // Arrange
    const listings = [
      listing({ id: 1, district: 'Баянзүрх', price: 1_200_000 }),
      listing({ id: 2, district: 'Баянзүрх', price: 1_800_000 }),
      listing({ id: 3, district: 'Хан-Уул', price: 1_000_000 }),
    ];

    // Act
    const result = filterListings(listings, { district: 'Баянзүрх', maxPrice: 1_500_000 });

    // Assert
    expect(result.map((item) => item.id)).toEqual([1]);
  });

  it('төрөл болон үнийн мужаар шүүж, үнийн өсөх дарааллаар буцаана', () => {
    // Arrange
    const listings = [
      listing({ id: 1, type: 'rent', price: 2_500_000 }),
      listing({ id: 2, type: 'sale', price: 1_500_000 }),
      listing({ id: 3, type: 'rent', price: 900_000 }),
      listing({ id: 4, type: 'rent', price: 1_200_000 }),
      listing({ id: 5, type: 'rent', price: 4_000_000 }),
    ];

    // Act
    const result = filterListings(listings, { type: 'rent', minPrice: 1_000_000, maxPrice: 3_000_000 });

    // Assert
    expect(result.map((item) => item.id)).toEqual([4, 1]);
    expect(result.map((item) => item.price)).toEqual([1_200_000, 2_500_000]);
  });

  // ---------- Хилийн тохиолдол (edge case) ----------

  it('хоосон жагсаалт болон хоосон шүүлтүүр өгөхөд алдаа гаргалгүй хоосон жагсаалт буцаана', () => {
    // Arrange
    const listings: Listing[] = [];

    // Act
    const withEmptyFilter = filterListings(listings, {});
    const withoutFilter = filterListings(listings);

    // Assert
    expect(withEmptyFilter).toEqual([]);
    expect(withoutFilter).toEqual([]);
  });

  it('сөрөг үнэ, эсвэл доод үнэ нь дээд үнээс их байвал InvalidFilterError шиднэ; маш том дээд үнэ зөвшөөрөгдөнө', () => {
    // Arrange
    const listings = [listing({ id: 1, price: 320_000_000 })];

    // Act
    const negativePrice = () => filterListings(listings, { minPrice: -1 });
    const reversedRange = () => filterListings(listings, { minPrice: 2_000_000, maxPrice: 1_000_000 });
    const hugeMaxPrice = filterListings(listings, { maxPrice: Number.MAX_SAFE_INTEGER });

    // Assert
    expect(negativePrice).toThrow(InvalidFilterError);
    expect(reversedRange).toThrow(InvalidFilterError);
    expect(hugeMaxPrice.map((item) => item.id)).toEqual([1]);
  });
});

describe('ListingsService.search — өгөгдлийн сангаас тусгаарласан тест', () => {
  // ---------- Mock ашигласан тест ----------

  it('repository-г mock-оор орлуулахад идэвхтэй, шүүлтүүрт тохирох зарыг буцааж, repository-г нэг л удаа дуудна', async () => {
    // Arrange: жинхэнэ өгөгдлийн сангийн оронд mock repository
    const findAll = jest.fn<ListingsRepository['findAll']>().mockResolvedValue([
      listing({ id: 10, district: 'Сүхбаатар', price: 900_000, active: true }),
      listing({ id: 11, district: 'Сүхбаатар', price: 700_000, active: false }),
      listing({ id: 12, district: 'Чингэлтэй', price: 800_000, active: true }),
    ]);
    const repositoryMock = { findAll } as unknown as ListingsRepository;
    const service = new ListingsService(repositoryMock);

    // Act
    const result = await service.search({ district: 'сүхбаатар' });

    // Assert
    expect(findAll).toHaveBeenCalledTimes(1);
    expect(result.map((item) => item.id)).toEqual([10]);
  });
});
