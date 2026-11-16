/**
 * Хоёр тооны нийлбэрийг буцаана.
 * @param {number} a
 * @param {number} b
 * @returns {number}
 * @throws {Error} аль нэг утга нь тоо биш бол
 */
function sum(a, b) {
  if (typeof a !== 'number' || typeof b !== 'number') {
    throw new Error('Тоо оруулах шаардлагатай!');
  }
  return a + b;
}

module.exports = sum;
