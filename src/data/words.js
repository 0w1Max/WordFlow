const db = require('../db/db.js');

function addWord(word) {
  return new Promise((resolve, reject) => {
    const sql = `
      INSERT INTO words (text, meaning, example, created_at, last_review, review_count)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    db.run(
      sql,
      [
        word.text,
        word.meaning,
        word.example,
        word.createdAt,
        word.lastReview,
        word.reviewCount
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
