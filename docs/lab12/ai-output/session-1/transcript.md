## Хэрэглэгч

бүртгэлийн validation функц бичээд өг

> _[AI хэрэгсэл ашигласан — Bash: List project files]_

> _[AI хэрэгсэл ашигласан — Write: d:\lab12-prompts\validateRegistration.js]_

> _[AI хэрэгсэл ашигласан — Bash: Run validation examples]_

## AI (Claude Code)

Бүртгэлийн validation функцийг JavaScript дээр [validateRegistration.js](validateRegistration.js) файлд бичлээ. `node validateRegistration.js` гэж ажиллуулахад зөв өгөгдөл `isValid: true` буцааж, буруу өгөгдөл талбар бүрт тохирох алдааны мессеж буцааж байна.

**Шалгах дүрэм:**

| Талбар | Дүрэм |
|---|---|
| `username` | Заавал. 3–20 тэмдэгт, латин үсгээр эхэлнэ, зөвхөн үсэг, тоо, `_` |
| `email` | Заавал. Имэйлийн зөв хэлбэртэй, 254 тэмдэгтээс ихгүй |
| `password` | Заавал. 8-аас дээш тэмдэгт, том үсэг, жижиг үсэг, тоо, тусгай тэмдэгттэй, хоосон зайгүй, хэрэглэгчийн нэрийг агуулахгүй |
| `confirmPassword` | Нууц үгтэй яг ижил байх |
| `phone` | Заавал биш. Монгол 8 оронтой дугаар, `+976` болон зай, зураастай бичиж болно |
| `birthDate` | Заавал биш. `YYYY-MM-DD` хэлбэрийн бодит огноо, 13–120 настай |

**Ашиглах жишээ:**
```js
const { validateRegistration } = require("./validateRegistration");

const { isValid, errors } = validateRegistration(formData);
if (!isValid) {
  // errors.email, errors.password гэх мэт мессежийг формын талбар бүрийн доор харуулна
}
```

Хэрэглэгчийн нэрийг латин үсгээр хязгаарласан, утасны дугаарыг 5–9-өөр эхэлдэг гэж үзсэн, насны доод хязгаарыг 13 гэж авсан. Эдгээрийг өөрчлөх бол хэлээрэй. Мөн өөр хэл (TypeScript, Python гэх мэт) эсвэл Zod, Yup зэрэг сан хэрэгтэй бол тэгж бичиж өгье.

