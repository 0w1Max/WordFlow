const { test } = require('node:test');
const assert = require('node:assert/strict');
const { validateWordInput } = require('../validators/wordValidator');
const { validateCredentials } = require('../validators/authValidator');
const { ValidationError } = require('../errors/AppError');

test('validateWordInput: пропускает корректные данные', () => {
  assert.doesNotThrow(() => validateWordInput({ text: 'Слово', meaning: 'Значение' }));
});

test('validateWordInput: требует непустое "Слово" и указывает field: "text"', () => {
  assert.throws(() => validateWordInput({ text: '   ', meaning: 'Значение' }), ValidationError);
  assert.throws(() => validateWordInput({ text: '', meaning: 'Значение' }), ValidationError);

  try {
    validateWordInput({ meaning: 'Значение' });
    assert.fail('ожидали, что бросит ValidationError');
  } catch (err) {
    assert.equal(err.field, 'text');
  }
});

test('validateWordInput: требует непустое "Значение" и указывает field: "meaning"', () => {
  try {
    validateWordInput({ text: 'Слово', meaning: '' });
    assert.fail('ожидали, что бросит ValidationError');
  } catch (err) {
    assert.equal(err.field, 'meaning');
  }
});

test('validateWordInput: пропускает корректный stressIndex', () => {
  // "Слово" — индекс 3 указывает на "в", валидная гласная в пределах строки
  assert.doesNotThrow(() => validateWordInput({ text: 'Слово', meaning: 'Значение', stressIndex: 3 }));
});

test('validateWordInput: пропускает отсутствие stressIndex (undefined/null)', () => {
  assert.doesNotThrow(() => validateWordInput({ text: 'Слово', meaning: 'Значение' }));
  assert.doesNotThrow(() => validateWordInput({ text: 'Слово', meaning: 'Значение', stressIndex: null }));
});

test('validateWordInput: отклоняет stressIndex вне границ текста и указывает field: "stressIndex"', () => {
  try {
    validateWordInput({ text: 'Слово', meaning: 'Значение', stressIndex: 99 });
    assert.fail('ожидали, что бросит ValidationError');
  } catch (err) {
    assert.ok(err instanceof ValidationError);
    assert.equal(err.field, 'stressIndex');
  }

  assert.throws(() => validateWordInput({ text: 'Слово', meaning: 'Значение', stressIndex: -1 }), ValidationError);
});

test('validateWordInput: отклоняет нецелый stressIndex', () => {
  assert.throws(() => validateWordInput({ text: 'Слово', meaning: 'Значение', stressIndex: 1.5 }), ValidationError);
  assert.throws(() => validateWordInput({ text: 'Слово', meaning: 'Значение', stressIndex: 'два' }), ValidationError);
});

test('validateCredentials: пропускает корректный email и пароль от 8 символов', () => {
  assert.doesNotThrow(() => validateCredentials({ email: 'user@example.com', password: 'password123' }));
});

test('validateCredentials: отклоняет некорректный email и указывает field: "email"', () => {
  assert.throws(() => validateCredentials({ email: 'not-an-email', password: 'password123' }), ValidationError);

  try {
    validateCredentials({ email: '', password: 'password123' });
    assert.fail('ожидали, что бросит ValidationError');
  } catch (err) {
    assert.equal(err.field, 'email');
  }
});

test('validateCredentials: отклоняет короткий пароль и указывает field: "password"', () => {
  try {
    validateCredentials({ email: 'user@example.com', password: '1234567' });
    assert.fail('ожидали, что бросит ValidationError');
  } catch (err) {
    assert.equal(err.field, 'password');
  }
});
