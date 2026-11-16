# Лаб 10 — Автомат тест бичих, CI Pipeline-д холбох

Branch: `lab10-tests` (`lab9-k8s` дээр суурилсан)

## Юу хийсэн

1. Jest тестийн санг суулгасан (`jest`, `@types/jest`, TypeScript-ийг хөрвүүлэх
   `@swc/jest`). Апп ESM тул тестийг `node --experimental-vm-modules`-ээр
   ажиллуулдаг — [app/jest.config.js](../../app/jest.config.js).
2. Тестлэх функц: зарыг үнэ, байршил, төрлөөр шүүдэг `filterListings()`
   (US-01) — [listings.service.ts](../../app/src/listings/listings.service.ts).
3. AAA (Arrange – Act – Assert) зарчмаар 5 тест бичсэн —
   [listings.service.spec.ts](../../app/src/listings/listings.service.spec.ts).
4. Лаб 7-ийн CI workflow репод байгаагүй тул
   [.github/workflows/ci.yml](../../.github/workflows/ci.yml)-ийг шинээр үүсгэсэн:
   checkout → setup-node → install → build → test, `push` ба `pull_request`
   trigger-тэй.
5. Локал дээр болон GitHub Actions дээр бүх тест амжилттай давсан.

## Тестүүд

| № | Төрөл | Юуг шалгадаг |
|---|---|---|
| 1 | Хэвийн | Дүүрэг болон дээд үнээр шүүхэд зөвхөн тохирох зар буцна |
| 2 | Хэвийн | Төрөл болон үнийн мужаар шүүж, үнийн өсөх дарааллаар буцаана |
| 3 | Edge case | Хоосон жагсаалт, хоосон шүүлтүүр өгөхөд алдаагүй хоосон жагсаалт буцна |
| 4 | Edge case | Сөрөг үнэ, доод үнэ > дээд үнэ бол `InvalidFilterError`; маш том дээд үнэ (`Number.MAX_SAFE_INTEGER`) зөвшөөрөгдөнө |
| 5 | Mock | `ListingsService.search()`-ийг `jest.fn()`-ээр хийсэн mock repository-оор өгөгдлийн давхаргаас тусгаарлаж, идэвхгүй зар гарахгүй, repository нэг л удаа дуудагдахыг шалгана |

## Ашигласан командууд

```powershell
cd app
npm install --save-dev jest @types/jest @swc/core @swc/jest
npm test

# CI-ийн алхмуудыг локал дээр давтах
npm ci
npm run build
npm test
```

## Үр дүн

- Локал: `Tests: 5 passed, 5 total`.
- GitHub Actions: run #1 амжилттай (19 секунд) —
  https://github.com/suzukk/Team-10/actions/runs/43887877091

## Хүлээлгэж өгөх зүйл

| Файл | Тайлбар |
|---|---|
| [app/src/listings/listings.service.spec.ts](../../app/src/listings/listings.service.spec.ts) | Тестийн файл (5 тест) |
| [.github/workflows/ci.yml](../../.github/workflows/ci.yml) | CI workflow |
| [01-ci-green.png](01-ci-green.png) | GitHub Actions дээр 5 тест давсан, CI ногоон |

## Тайланд оруулах тайлбар

Зарыг үнэ болон байршлаар шүүдэг `filterListings()` функц дээр Jest ашиглан AAA
(Arrange–Act–Assert) зарчмаар нийт 5 unit тест бичсэн: хэвийн тохиолдлын 2,
хилийн тохиолдлын 2 (хоосон оролт; сөрөг болон маш том үнэ), mock ашигласан 1.
Mock тестэд өгөгдлийн давхарга болох `ListingsRepository`-г `jest.fn()`-ээр
орлуулсан тул service-ийн логикийг өгөгдлийн сангаас хамааралгүйгээр шалгасан.
Дараа нь checkout, setup, install, build, test алхамтай GitHub Actions workflow
үүсгэж, `push` болон `pull_request` бүрд автоматаар ажиллахаар тохируулсан.
Branch-ийг push хийхэд CI pipeline 19 секундэд ажиллаж, 5 тест бүгд амжилттай
давсан.
