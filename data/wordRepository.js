const db = require('../db/db.js');

function runQuery(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (error) {
      if (error) {
        reject(error);
      } else {
        resolve(this);
      }
    });
  });
}

function getAllQuery(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (error, rows) => {
      if (error) {
        reject(error);
      } else {
        resolve(rows);
      }
    });
  });
}

async function addWord(word) {
  if (!word.text || word.text.trim() === '') {
    throw new Error('Поле "Текст" обязательное!')
  }

  if (!word.meaning || word.meaning.trim() === '') {
    throw new Error('Поле "Значение" обязательное!')
  }

   const sql = `
    INSERT INTO words (text, meaning, example)
    VALUES (?, ?, ?)
  `;

  const result = await runQuery(sql, [
    word.text,
    word.meaning,
    word.example,
  ]);

  return { id: result.lastID, ...word };
}

async function getAllWords() {
  const sql = `SELECT * FROM words`;
  
  const rows = await getAllQuery(sql);

  return rows;
}


module.exports = {
  addWord,
  getAllWords
};
