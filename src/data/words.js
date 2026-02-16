const db = require('../db/db.js');

function addWord(word) {
  if (!word.text || word.text.trim() === '') {
    throw new Error('Поле "Текст" обязательное!')
  }

  if (!word.meaning || word.meaning.trim() === '') {
    throw new Error('Поле "Значение" обязательное!')
  }

  return new Promise((resolve, reject) => {
    const sql = `
      INSERT INTO words (text, meaning, example)
      VALUES (?, ?, ?)
    `;

    db.run(
      sql,
      [
        word.text,
        word.meaning,
        word.example,
      ],
      function (error) {
        if (error) {
          reject(error);
        } else {
          resolve({ id: this.lastID, ...word });
        }
      }
    );
  });
}

function getAllWords() {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM words', (error, rows) => {
      if (error) {
        reject(error);
      } else {
        resolve(rows);
      }
    });
  });
}

module.exports = {
  addWord,
  getAllWords
};
