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
