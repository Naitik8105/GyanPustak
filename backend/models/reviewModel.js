const pool = require('../config/db');

async function addReview({ student_id, book_id, rating, review_text }) {
  const [existing] = await pool.execute(
    `SELECT review_id FROM review WHERE student_id = ? AND book_id = ?`,
    [student_id, book_id]
  );

  if (existing.length) {
    await pool.execute(
      `UPDATE review SET rating = ?, review_text = ?, review_date = CURRENT_TIMESTAMP
       WHERE student_id = ? AND book_id = ?`,
      [rating, review_text || null, student_id, book_id]
    );
    return existing[0].review_id;
  }

  const [result] = await pool.execute(
    `INSERT INTO review (student_id, book_id, rating, review_text)
     VALUES (?, ?, ?, ?)`,
    [student_id, book_id, rating, review_text || null]
  );
  return result.insertId;
}

async function listReviewsByBook(bookId) {
  const [rows] = await pool.execute(
    `SELECT r.review_id, r.rating, r.review_text, r.review_date, p.first_name, p.last_name
     FROM review r
     JOIN person p ON p.person_id = r.student_id
     WHERE r.book_id = ?
     ORDER BY r.review_date DESC`,
    [bookId]
  );
  return rows;
}

module.exports = { addReview, listReviewsByBook };
