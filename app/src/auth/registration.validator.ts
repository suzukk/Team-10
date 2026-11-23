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
