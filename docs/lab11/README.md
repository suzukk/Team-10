# Лаб 11 — Статик шинжилгээ, эмзэг байдал илрүүлэх

Branch: `lab11-lint` (`lab10-tests` дээр суурилсан)

## Юу хийсэн

1. ESLint 10-ийг flat config-оор тохируулсан —
   [app/eslint.config.js](../../app/eslint.config.js). Суурь дүрмийн багц:
   `@eslint/js` recommended + `typescript-eslint` strictTypeChecked ба
   stylisticTypeChecked, дээр нь `eqeqeq`, `no-console`, `prefer-const`,
   функцийн буцаах төрлийг заавал бичих дүрэм.
2. Засахаас өмнөх гаралтыг [lint-before.txt](lint-before.txt)-д хадгалсан:
   **9 асуудал (8 алдаа, 1 анхааруулга)**.
3. Асуудлуудыг зассан (доорх хүснэгт).
4. Зассаны дараах гаралтыг [lint-after.txt](lint-after.txt)-д хадгалсан:
   **0 асуудал**.
5. `npm audit` ажиллуулж, үр дүнг ангилан [audit-report.txt](audit-report.txt)-д
   хадгалсан.
6. CI workflow-д `npx eslint .` алхам нэмсэн —
   [.github/workflows/ci.yml](../../.github/workflows/ci.yml).

Тэмдэглэл: `typescript-eslint` нь TypeScript 7-г хараахан дэмждэггүй тул
TypeScript-ийг 6.0 хувилбарт тогтоосон.

## Linter: өмнө / дараа

| | Алдаа | Анхааруулга | Нийт |
|---|---|---|---|
| Өмнө | 8 | 1 | 9 |
| Дараа | 0 | 0 | 0 |

| № | Файл | Дүрэм | Асуудал | Засвар |
|---|---|---|---|---|
| 1 | `app.module.ts` | `no-extraneous-class` | Хоосон класс | NestJS-ийн `@Module()` класс зориуд хоосон байдаг тул дүрмийг `allowWithDecorator: true` гэж тохируулсан |
| 2 | `listings.controller.ts` | `prefer-nullish-coalescing` | `district \|\| undefined` | Илүүдэл хувиргалтыг хассан — хоосон мөрийг `filterListings()` өөрөө шүүлтүүргүй гэж үздэг |
| 3 | `listings.controller.ts` | `restrict-template-expressions` | Template literal-д `number` шууд орсон | `String(id)` |
| 4, 5 | `listings.repository.ts` | `require-await` | `await`-гүй `async` метод (2) | `async`-ийг хасаж `Promise.resolve(...)` буцаадаг болгосон |
| 6, 7 | `listings.service.spec.ts` | `explicit-function-return-type` | Буцаах төрөлгүй функц (2) | `(): Listing[] =>` |
| 8 | `main.ts` | `no-console` | `console.log` | NestJS-ийн `Logger` ашигласан |
| 9 | `main.ts` | `restrict-template-expressions` | Template literal-д `number` шууд орсон | `String(port)` |

Зассаны дараа build болон 5 unit тест хэвээр амжилттай.

## npm audit

| Түвшин | Тоо |
|---|---|
| Critical | 0 |
| High | 0 |
| Medium (moderate) | 22 |
| Low | 3 |

- 25 бичлэг нь дамжих 3 сангийн 3 advisory-оос үүдэлтэй: `minimatch`
  (Medium, DoS), `glob` (Medium), `deepmerge` (Low). Бүгд `jest` болон
  `typescript-eslint`-ээр дамжиж орж ирсэн.
- `npm audit --omit=dev` → **0 эмзэг байдал**: production хамаарал цэвэр, эдгээр
  сан Docker image-д ордоггүй.
- Critical/High илрээгүй тул заавал шинэчлэх сан байхгүй.
- Medium/Low-г шинэчлээгүй шалтгаан: `npm audit fix --force`-ийн санал болгож
  буй засвар нь `jest` 30 → 25, `typescript-eslint` 8.72 → 8.36 руу буцаах
  өөрчлөлт бөгөөд тест, linter-ийг эвдэнэ. Хоёр сан хоёулаа одоогийн хамгийн
  сүүлийн хувилбар дээрээ байгаа тул засвартай хувилбар гарахыг хүлээнэ.

## Ашигласан командууд

```powershell
cd app
npm install --save-dev typescript@~6.0
npm install --save-dev eslint @eslint/js typescript-eslint globals

npx eslint .                 # өмнө: 9 асуудал, дараа: 0
npm audit
npm audit --omit=dev
npm audit fix
```

## Хүлээлгэж өгөх зүйл

| Файл | Тайлбар |
|---|---|
| [lint-before.txt](lint-before.txt) | Засахаас өмнөх ESLint гаралт (9 асуудал) |
| [lint-after.txt](lint-after.txt) | Зассаны дараах ESLint гаралт (0 асуудал) |
| [audit-report.txt](audit-report.txt) | `npm audit` тайлан, ангилал, дүгнэлт |
| [app/eslint.config.js](../../app/eslint.config.js) | ESLint тохиргоо |
| [.github/workflows/ci.yml](../../.github/workflows/ci.yml) | Lint алхам нэмсэн CI workflow |
| `01-ci-lint-green.png` | Lint алхамтай CI ногоон |

## Тайланд оруулах тайлбар

Төсөлд ESLint-ийг `typescript-eslint`-ийн strict дүрмийн багцтай тохируулж
ажиллуулахад 9 асуудал (8 алдаа, 1 анхааруулга) илэрсэн: `await`-гүй `async`
метод, буцаах төрөл заагаагүй функц, `console.log` ашигласан зэрэг. Эдгээрийг
нэг бүрчлэн засаж, linter-ийн гаралтыг 0 асуудалтай болгосон бөгөөд засварын
дараа unit тестүүд хэвээр амжилттай давсан. `npm audit` командаар хамаарлыг
шалгахад Critical болон High түвшний эмзэг байдал илрээгүй, 22 Medium, 3 Low
түвшний бичлэг гарсан нь бүгд хөгжүүлэлтийн хэрэгслээр (jest, typescript-eslint)
дамжиж орж ирсэн `minimatch`, `glob`, `deepmerge` сангаас үүдэлтэй байв.
Production хамаарал (`npm audit --omit=dev`) эмзэг байдалгүй. Эцэст нь
`npx eslint .` алхмыг CI workflow-д нэмсэн тул код push хийх бүрд стилийн
шалгалт автоматаар ажиллана.
