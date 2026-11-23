# Prompt 2 — тодорхой, контексттэй

Технологи, шаардлага, аюулгүй байдал, стиль, хариуны хэлбэрийг тодорхой заасан.

```
Би үл хөдлөх хөрөнгө зарах, түрээслэх вебийн backend-ийг NestJS 12 дээр
TypeScript (ESM, "strict": true)-ээр хийж байна. "Шинэ хэрэглэгч бүртгэл үүсгэх"
user story-д бүртгэлийн оролтыг шалгадаг цэвэр (pure) функц хэрэгтэй.

Функц: validateRegistration(input: unknown): ValidationResult

Оролт: { name, email, phone, password }

Шаардлага:
- name: trim хийсний дараа 2–50 тэмдэгт.
- email: зөв хэлбэртэй, trim хийж жижиг үсэг болгоно, 254 тэмдэгтээс урт биш.
- phone: Монголын 8 оронтой дугаар, 6, 7, 8 эсвэл 9-өөр эхэлнэ. "+976" угтвар,
  зай, зураасыг зөвшөөрч, цэвэрлээд зөвхөн 8 оронг хадгална.
- password: 8–64 тэмдэгт, дор хаяж 1 том үсэг, 1 жижиг үсэг, 1 тоо агуулна.
  Имэйлийн @-ийн өмнөх хэсгийг агуулж болохгүй.

Буцаах утга:
- Амжилттай: { valid: true, value: { name, email, phone } } — нууц үгийг буцаахгүй.
- Алдаатай: { valid: false, errors: { field: string; message: string }[] } —
  бүх алдааг нэг дор, мессеж нь монгол хэлээр.

Аюулгүй байдал:
- Оролт object биш, эсвэл талбар string биш бол throw хийлгүй алдааны жагсаалт буцаана.
- ReDoS (catastrophic backtracking)-д өртөмтгий regex ашиглахгүй.
- Нууц үгийг console, log, алдааны мессежинд хэзээ ч гаргахгүй.
- Гадаад сан (class-validator гэх мэт) ашиглахгүй.

Стиль: ESLint typescript-eslint strictTypeChecked дүрэмд нийцнэ, функц бүрт
буцаах төрөл заана, `any` ашиглахгүй.

Мөн Jest (@jest/globals) ашиглан AAA (Arrange-Act-Assert) зарчмаар 6–8 unit тест
бич: хэвийн тохиолдол болон edge case.

Файл үүсгэлгүй, зөвхөн чатад хоёр код блокоор хариул:
registration.validator.ts ба registration.validator.spec.ts.
```
