/**
 * Бүртгэлийн формын өгөгдлийг шалгана.
 *
 * @param {Object} data
 * @param {string} data.username         - Хэрэглэгчийн нэр
 * @param {string} data.email            - Имэйл хаяг
 * @param {string} data.password         - Нууц үг
 * @param {string} data.confirmPassword  - Нууц үг давтах
 * @param {string} [data.phone]          - Утасны дугаар (заавал биш, 8 оронтой)
 * @param {string} [data.birthDate]      - Төрсөн огноо (заавал биш, YYYY-MM-DD)
 * @returns {{ isValid: boolean, errors: Object<string, string> }}
 */
function validateRegistration(data = {}) {
  const errors = {};
  const str = (v) => (typeof v === "string" ? v.trim() : "");

  const username = str(data.username);
  const email = str(data.email);
  const password = typeof data.password === "string" ? data.password : "";
  const confirmPassword =
    typeof data.confirmPassword === "string" ? data.confirmPassword : "";
  const phone = str(data.phone);
  const birthDate = str(data.birthDate);

  // Хэрэглэгчийн нэр: 3–20 тэмдэгт, үсэг/тоо/доогуур зураас, үсгээр эхэлнэ
  if (!username) {
    errors.username = "Хэрэглэгчийн нэр оруулна уу.";
  } else if (username.length < 3 || username.length > 20) {
    errors.username = "Хэрэглэгчийн нэр 3–20 тэмдэгт байх ёстой.";
  } else if (!/^[A-Za-z][A-Za-z0-9_]*$/.test(username)) {
    errors.username =
      "Хэрэглэгчийн нэр латин үсгээр эхэлж, зөвхөн үсэг, тоо, _ агуулна.";
  }

  // Имэйл
  if (!email) {
    errors.email = "Имэйл хаяг оруулна уу.";
  } else if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    errors.email = "Имэйл хаяг буруу байна.";
  }

  // Нууц үг: 8+ тэмдэгт, том үсэг, жижиг үсэг, тоо, тусгай тэмдэгт
  if (!password) {
    errors.password = "Нууц үг оруулна уу.";
  } else {
    const missing = [];
    if (password.length < 8) missing.push("хамгийн багадаа 8 тэмдэгт");
    if (!/[A-Z]/.test(password)) missing.push("том үсэг");
    if (!/[a-z]/.test(password)) missing.push("жижиг үсэг");
    if (!/\d/.test(password)) missing.push("тоо");
    if (!/[^A-Za-z0-9]/.test(password)) missing.push("тусгай тэмдэгт");
    if (/\s/.test(password)) missing.push("хоосон зайгүй байх");
    if (missing.length) {
      errors.password = `Нууц үг дараахыг агуулах ёстой: ${missing.join(", ")}.`;
    } else if (username && password.toLowerCase().includes(username.toLowerCase())) {
      errors.password = "Нууц үгэнд хэрэглэгчийн нэрийг ашиглаж болохгүй.";
    }
  }

  // Нууц үг давтах
  if (!confirmPassword) {
    errors.confirmPassword = "Нууц үгээ давтан оруулна уу.";
  } else if (password !== confirmPassword) {
    errors.confirmPassword = "Нууц үг таарахгүй байна.";
  }

  // Утас (заавал биш): Монгол 8 оронтой дугаар, +976 угтвартай байж болно
  if (phone) {
    const normalized = phone.replace(/[\s-]/g, "");
    if (!/^(\+976)?[5-9]\d{7}$/.test(normalized)) {
      errors.phone = "Утасны дугаар 8 оронтой байх ёстой (жишээ: 99112233).";
    }
  }

  // Төрсөн огноо (заавал биш): бодит огноо, 13-аас дээш настай
  if (birthDate) {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(birthDate);
    const date = m ? new Date(Date.UTC(+m[1], +m[2] - 1, +m[3])) : null;
    const isRealDate =
      date &&
      date.getUTCFullYear() === +m[1] &&
      date.getUTCMonth() === +m[2] - 1 &&
      date.getUTCDate() === +m[3];

    if (!isRealDate) {
      errors.birthDate = "Төрсөн огноо буруу байна (YYYY-MM-DD).";
    } else {
      const today = new Date();
      let age = today.getUTCFullYear() - date.getUTCFullYear();
      const beforeBirthday =
        today.getUTCMonth() < date.getUTCMonth() ||
        (today.getUTCMonth() === date.getUTCMonth() &&
          today.getUTCDate() < date.getUTCDate());
      if (beforeBirthday) age--;

      if (date > today) errors.birthDate = "Төрсөн огноо ирээдүйд байж болохгүй.";
      else if (age < 13) errors.birthDate = "13-аас дээш настай байх шаардлагатай.";
      else if (age > 120) errors.birthDate = "Төрсөн огноо буруу байна.";
    }
  }

  return { isValid: Object.keys(errors).length === 0, errors };
}

module.exports = { validateRegistration };

// Жишээ: `node validateRegistration.js`
if (require.main === module) {
  console.log(
    validateRegistration({
      username: "bat_2024",
      email: "bat@example.com",
      password: "Strong#Pass1",
      confirmPassword: "Strong#Pass1",
      phone: "+976 9911-2233",
      birthDate: "2000-05-15",
    })
  );
  console.log(
    validateRegistration({
      username: "1a",
      email: "bad-email",
      password: "abc",
      confirmPassword: "abcd",
      phone: "123",
      birthDate: "2023-02-30",
    })
  );
}
