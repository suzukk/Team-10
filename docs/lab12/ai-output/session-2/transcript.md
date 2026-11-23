## Хэрэглэгч

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

## AI (Claude Code)

**registration.validator.ts**

```ts
/**
 * Бүртгэлийн оролтыг шалгах цэвэр (pure) функц.
 * - Гадаад сан ашиглахгүй.
 * - Ашигласан бүх regex нь шугаман хугацаанд ажиллана: давхар quantifier,
 *   alternation дээрх quantifier байхгүй. Урт оролтыг regex-ээс өмнө хязгаарлана.
 * - Нууц үгийг буцаах утга, алдааны мессеж, log-д хэзээ ч гаргахгүй.
 */

export type RegistrationField = 'input' | 'name' | 'email' | 'phone' | 'password';

export interface ValidationError {
  readonly field: RegistrationField;
  readonly message: string;
}

export interface RegistrationValue {
  readonly name: string;
  readonly email: string;
  readonly phone: string;
}

export type ValidationResult =
  | { readonly valid: true; readonly value: RegistrationValue }
  | { readonly valid: false; readonly errors: readonly ValidationError[] };

type FieldOutcome<T> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly messages: readonly string[] };

type StringCheck =
  | { readonly ok: true; readonly value: string }
  | { readonly ok: false; readonly message: string };

const NAME_MIN = 2;
const NAME_MAX = 50;
const EMAIL_MAX = 254;
const EMAIL_LOCAL_MAX = 64;
const EMAIL_DOMAIN_MAX = 253;
const DOMAIN_LABEL_MAX = 63;
const PHONE_RAW_MAX = 32;
const PASSWORD_MIN = 8;
const PASSWORD_MAX = 64;
const MN_PHONE_PREFIX = '+976';

// Бүгд нэг тэмдэгтийн анги эсвэл тогтмол урттай — backtracking үүсэхгүй.
const EMAIL_LOCAL_RE = /^[a-z0-9!#$%&'*+/=?^_`{|}~.-]+$/;
const DOMAIN_LABEL_RE = /^[a-z0-9-]+$/;
const TLD_RE = /^[a-z]{2,63}$/;
const PHONE_SEPARATORS_RE = /[\s-]/g;
const MN_PHONE_RE = /^[6-9][0-9]{7}$/;
const UPPERCASE_RE = /[A-Z]/;
const LOWERCASE_RE = /[a-z]/;
const DIGIT_RE = /[0-9]/;

const MESSAGES = {
  invalidInput: 'Бүртгэлийн мэдээлэл объект хэлбэртэй байх ёстой.',
  nameLength: `Нэр ${String(NAME_MIN)}–${String(NAME_MAX)} тэмдэгт байх ёстой.`,
  emailFormat: 'Имэйл хаяг буруу хэлбэртэй байна.',
  emailTooLong: `Имэйл хаяг ${String(EMAIL_MAX)} тэмдэгтээс урт байж болохгүй.`,
  phoneFormat: 'Утасны дугаар 6, 7, 8 эсвэл 9-өөр эхэлсэн 8 оронтой байх ёстой.',
  passwordLength: `Нууц үг ${String(PASSWORD_MIN)}–${String(PASSWORD_MAX)} тэмдэгт байх ёстой.`,
  passwordUppercase: 'Нууц үг дор хаяж нэг том үсэг агуулах ёстой.',
  passwordLowercase: 'Нууц үг дор хаяж нэг жижиг үсэг агуулах ёстой.',
  passwordDigit: 'Нууц үг дор хаяж нэг тоо агуулах ёстой.',
  passwordContainsEmail: 'Нууц үг имэйл хаягийн @-ийн өмнөх хэсгийг агуулж болохгүй.',
} as const;

function required(label: string): string {
  return `${label} оруулна уу.`;
}

function notText(label: string): string {
  return `${label} текст хэлбэртэй байх ёстой.`;
}

function ok<T>(value: T): FieldOutcome<T> {
  return { ok: true, value };
}

function fail<T>(...messages: string[]): FieldOutcome<T> {
  return { ok: false, messages };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** Зөвхөн өөрийн data property-г уншина: getter ажиллуулахгүй, prototype-оос уншихгүй. */
function readOwn(source: Record<string, unknown>, key: string): unknown {
  const descriptor = Object.getOwnPropertyDescriptor(source, key);
  if (descriptor === undefined || !('value' in descriptor)) {
    return undefined;
  }
  const value: unknown = descriptor.value;
  return value;
}

function requireString(raw: unknown, label: string): StringCheck {
  if (raw === undefined || raw === null) {
    return { ok: false, message: required(label) };
  }
  if (typeof raw !== 'string') {
    return { ok: false, message: notText(label) };
  }
  return { ok: true, value: raw };
}

function validateName(raw: unknown): FieldOutcome<string> {
  const checked = requireString(raw, 'Нэр');
  if (!checked.ok) {
    return fail(checked.message);
  }
  const name = checked.value.trim();
  if (name.length === 0) {
    return fail(required('Нэр'));
  }
  // UTF-16 урт > 2×MAX бол code point тоо заавал MAX-аас их — том массив үүсгэхгүй.
  if (name.length > NAME_MAX * 2) {
    return fail(MESSAGES.nameLength);
  }
  const charCount = Array.from(name).length;
  if (charCount < NAME_MIN || charCount > NAME_MAX) {
    return fail(MESSAGES.nameLength);
  }
  return ok(name);
}

function isValidDomainLabel(label: string): boolean {
  return (
    label.length > 0 &&
    label.length <= DOMAIN_LABEL_MAX &&
    DOMAIN_LABEL_RE.test(label) &&
    !label.startsWith('-') &&
    !label.endsWith('-')
  );
}

function isValidEmailShape(email: string): boolean {
  const at = email.indexOf('@');
  if (at <= 0 || at !== email.lastIndexOf('@')) {
    return false;
  }
  const local = email.slice(0, at);
  const domain = email.slice(at + 1);

  if (local.length > EMAIL_LOCAL_MAX || domain.length === 0 || domain.length > EMAIL_DOMAIN_MAX) {
    return false;
  }
  if (
    !EMAIL_LOCAL_RE.test(local) ||
    local.startsWith('.') ||
    local.endsWith('.') ||
    local.includes('..')
  ) {
    return false;
  }

  const labels = domain.split('.');
  if (labels.length < 2 || !labels.every(isValidDomainLabel)) {
    return false;
  }
  const tld = labels.at(-1);
  return tld !== undefined && TLD_RE.test(tld);
}

function validateEmail(raw: unknown): FieldOutcome<string> {
  const checked = requireString(raw, 'Имэйл');
  if (!checked.ok) {
    return fail(checked.message);
  }
  const email = checked.value.trim().toLowerCase();
  if (email.length === 0) {
    return fail(required('Имэйл'));
  }
  if (email.length > EMAIL_MAX) {
    return fail(MESSAGES.emailTooLong);
  }
  if (!isValidEmailShape(email)) {
    return fail(MESSAGES.emailFormat);
  }
  return ok(email);
}

function validatePhone(raw: unknown): FieldOutcome<string> {
  const checked = requireString(raw, 'Утасны дугаар');
  if (!checked.ok) {
    return fail(checked.message);
  }
  const trimmed = checked.value.trim();
  if (trimmed.length === 0) {
    return fail(required('Утасны дугаар'));
  }
  if (trimmed.length > PHONE_RAW_MAX) {
    return fail(MESSAGES.phoneFormat);
  }
  const compact = trimmed.replace(PHONE_SEPARATORS_RE, '');
  const digits = compact.startsWith(MN_PHONE_PREFIX)
    ? compact.slice(MN_PHONE_PREFIX.length)
    : compact;
  if (!MN_PHONE_RE.test(digits)) {
    return fail(MESSAGES.phoneFormat);
  }
  return ok(digits);
}

/** Имэйл string бол @-ийн өмнөх хэсгийг (жижиг үсгээр) буцаана. */
function extractEmailLocalPart(raw: unknown): string | null {
  if (typeof raw !== 'string') {
    return null;
  }
  const normalized = raw.trim().toLowerCase();
  const at = normalized.indexOf('@');
  return at > 0 ? normalized.slice(0, at) : null;
}

/** Зөвхөн алдааны мессеж буцаана — нууц үгийн утгыг хэзээ ч буцаахгүй. */
function validatePassword(raw: unknown, emailLocalPart: string | null): readonly string[] {
  const checked = requireString(raw, 'Нууц үг');
  if (!checked.ok) {
    return [checked.message];
  }
  const password = checked.value;
  if (password.length === 0) {
    return [required('Нууц үг')];
  }

  const messages: string[] = [];
  if (password.length < PASSWORD_MIN || password.length > PASSWORD_MAX) {
    messages.push(MESSAGES.passwordLength);
  }
  if (!UPPERCASE_RE.test(password)) {
    messages.push(MESSAGES.passwordUppercase);
  }
  if (!LOWERCASE_RE.test(password)) {
    messages.push(MESSAGES.passwordLowercase);
  }
  if (!DIGIT_RE.test(password)) {
    messages.push(MESSAGES.passwordDigit);
  }
  if (
    emailLocalPart !== null &&
    emailLocalPart.length > 0 &&
    password.toLowerCase().includes(emailLocalPart)
  ) {
    messages.push(MESSAGES.passwordContainsEmail);
  }
  return messages;
}

function collect<T>(
  field: RegistrationField,
  outcome: FieldOutcome<T>,
  errors: ValidationError[],
): void {
  if (!outcome.ok) {
    for (const message of outcome.messages) {
      errors.push({ field, message });
    }
  }
}

export function validateRegistration(input: unknown): ValidationResult {
  if (!isRecord(input)) {
    return { valid: false, errors: [{ field: 'input', message: MESSAGES.invalidInput }] };
  }

  let rawName: unknown;
  let rawEmail: unknown;
  let rawPhone: unknown;
  let rawPassword: unknown;
  try {
    rawName = readOwn(input, 'name');
    rawEmail = readOwn(input, 'email');
    rawPhone = readOwn(input, 'phone');
    rawPassword = readOwn(input, 'password');
  } catch {
    // Жишээ нь Proxy trap throw хийвэл — дотоод мэдээлэл задруулахгүй.
    return { valid: false, errors: [{ field: 'input', message: MESSAGES.invalidInput }] };
  }

  const name = validateName(rawName);
  const email = validateEmail(rawEmail);
  const phone = validatePhone(rawPhone);
  const passwordMessages = validatePassword(rawPassword, extractEmailLocalPart(rawEmail));

  const errors: ValidationError[] = [];
  collect('name', name, errors);
  collect('email', email, errors);
  collect('phone', phone, errors);
  for (const message of passwordMessages) {
    errors.push({ field: 'password', message });
  }

  if (name.ok && email.ok && phone.ok && passwordMessages.length === 0) {
    return {
      valid: true,
      value: { name: name.value, email: email.value, phone: phone.value },
    };
  }
  return { valid: false, errors };
}
```

**registration.validator.spec.ts**

```ts
import { describe, expect, it } from '@jest/globals';
import {
  validateRegistration,
  type ValidationError,
  type ValidationResult,
} from './registration.validator.js';

function errorsOf(result: ValidationResult): readonly ValidationError[] {
  return result.valid ? [] : result.errors;
}

function fieldsOf(result: ValidationResult): string[] {
  return [...new Set(errorsOf(result).map((error) => error.field))].sort();
}

describe('validateRegistration', () => {
  it('зөв оролтыг цэвэрлэж буцаана, нууц үгийг буцаахгүй', () => {
    // Arrange
    const input = {
      name: '  Бат-Эрдэнэ  ',
      email: '  Bat.Erdene@Example.MN ',
      phone: '+976 9911-2233',
      password: 'Ulaanbaatar2025',
    };

    // Act
    const result = validateRegistration(input);

    // Assert
    expect(result).toEqual({
      valid: true,
      value: { name: 'Бат-Эрдэнэ', email: 'bat.erdene@example.mn', phone: '99112233' },
    });
    expect(result).not.toHaveProperty('value.password');
  });

  it.each([
    ['88112233', '88112233'],
    ['+97677112233', '77112233'],
    ['6011 2233', '60112233'],
    [' +976-9911-22-33 ', '99112233'],
  ])('утасны "%s" хэлбэрийг "%s" болгон цэвэрлэнэ', (rawPhone, expected) => {
    // Arrange
    const input = { name: 'Болд', email: 'bold@mail.mn', phone: rawPhone, password: 'Secure123' };

    // Act
    const result = validateRegistration(input);

    // Assert
    expect(result.valid && result.value.phone).toBe(expected);
  });

  it.each([null, undefined, 'string', 42, ['a', 'b']])(
    'оролт object биш (%p) бол throw хийлгүй алдаа буцаана',
    (input) => {
      // Arrange — input нь параметрээр ирнэ

      // Act
      const act = (): ValidationResult => validateRegistration(input);

      // Assert
      expect(act).not.toThrow();
      expect(fieldsOf(act())).toEqual(['input']);
    },
  );

  it('талбарууд string биш бол талбар бүрт алдаа буцаана', () => {
    // Arrange
    const input = { name: 123, email: null, phone: ['99112233'], password: {} };

    // Act
    const result = validateRegistration(input);

    // Assert
    expect(result.valid).toBe(false);
    expect(fieldsOf(result)).toEqual(['email', 'name', 'password', 'phone']);
    expect(errorsOf(result)).toHaveLength(4);
  });

  it('бүх алдааг нэг дор цуглуулж, монгол хэлээр буцаана', () => {
    // Arrange
    const input = { name: ' А ', email: 'not-an-email', phone: '12345678', password: 'short' };

    // Act
    const result = validateRegistration(input);

    // Assert
    const errors = errorsOf(result);
    expect(fieldsOf(result)).toEqual(['email', 'name', 'password', 'phone']);
    expect(errors.filter((e) => e.field === 'password')).toHaveLength(3);
    expect(errors.find((e) => e.field === 'name')?.message).toBe('Нэр 2–50 тэмдэгт байх ёстой.');
  });

  it('нууц үг имэйлийн @-ийн өмнөх хэсгийг (том/жижиг үсэг үл хамааран) агуулбал татгалзана', () => {
    // Arrange
    const input = { name: 'Болд', email: 'Bold@Mail.mn', phone: '99112233', password: 'MyBOLD123' };

    // Act
    const result = validateRegistration(input);

    // Assert
    expect(errorsOf(result)).toEqual([
      { field: 'password', message: 'Нууц үг имэйл хаягийн @-ийн өмнөх хэсгийг агуулж болохгүй.' },
    ]);
  });

  it('254 тэмдэгтээс урт болон буруу хэлбэрийн имэйлийг татгалзана', () => {
    // Arrange
    const tooLong = `${'a'.repeat(64)}@${'b'.repeat(190)}.mn`; // 258 тэмдэгт
    const base = { name: 'Сарнай', phone: '99112233', password: 'Secure123' };

    // Act
    const longResult = validateRegistration({ ...base, email: tooLong });
    const badResults = ['a@@b.mn', '.a@b.mn', 'a..b@c.mn', 'a@-b.mn', 'a@b', 'a@b.c'].map((email) =>
      validateRegistration({ ...base, email }),
    );

    // Assert
    expect(errorsOf(longResult)[0]?.message).toContain('254');
    for (const result of badResults) {
      expect(fieldsOf(result)).toEqual(['email']);
    }
  });

  it('нууц үгийг алдаанд гаргахгүй, маш урт оролтыг хурдан боловсруулна (ReDoS-гүй)', () => {
    // Arrange
    const secret = 'TopSecretValue!';
    const huge = `${'a'.repeat(50_000)}!`;
    const input = { name: huge, email: `${huge}@${huge}`, phone: huge, password: secret };

    // Act
    const started = performance.now();
    const result = validateRegistration(input);
    const elapsedMs = performance.now() - started;

    // Assert
    expect(result.valid).toBe(false);
    expect(JSON.stringify(result)).not.toContain(secret);
    expect(elapsedMs).toBeLessThan(200);
  });
});
```

Тэмдэглэл:
- **Талбарыг унших:** утгыг `Object.getOwnPropertyDescriptor`-оор уншдаг. Тиймээс getter ажиллахгүй, prototype pollution-оос нөлөөлөгдөхгүй, Proxy throw хийхэд ч функц throw хийхгүй.
- **Regex ба ReDoS:** бүх regex нэг тэмдэгтийн ангиас бүрдэнэ, давхар quantifier байхгүй. Имэйлийг regex-ээр биш, гараар задалж шалгадаг. Урт оролтыг regex-ээс өмнө хязгаарлана.
- **Нууц үг ба имэйл:** имэйл буруу хэлбэртэй байсан ч `@`-ийн өмнөх хэсэг нь гарч ирж байвал нууц үгэнд агуулагдсан эсэхийг шалгана. Харьцуулалт том, жижиг үсгийг ялгахгүй. Шаардлагын дагуу хатуу мөрдсөн тул `a@x.mn` шиг 1 тэмдэгттэй хэсэгтэй имэйлд энэ дүрэм хэт хатуу ажиллана. Хүсвэл доод уртын босго (жишээ нь ≥3) нэмж болно.
- **Утасны дугаар:** зөвхөн `+976` угтварыг хүлээн авна, `976`-г нэмэхгүйгээр бичсэнийг зөвшөөрөхгүй.
- **Тест (ESM):** spec файл `.js` өргөтгөлтэй import хийдэг тул Jest-ийн тохиргоонд `moduleNameMapper: { '^(\\.{1,2}/.*)\\.js$': '$1' }` хэрэгтэй.
- **Шалгалт:** би энэ кодыг ажиллуулаагүй, tsc, ESLint, Jest-ээр шалгаагүй.

