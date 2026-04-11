const pool = require('../config/db');

async function listBooks(search = '') {
  const q = `%${search}%`;
  const [rows] = await pool.execute(
    `SELECT book_id, title, isbn, publisher, publication_date, edition_number, language,
            book_type, purchase_option, format, price, quantity, category, subcategory
     FROM book
     WHERE title LIKE ? OR isbn LIKE ? OR publisher LIKE ? OR category LIKE ? OR subcategory LIKE ?
     ORDER BY book_id DESC`,
    [q, q, q, q, q]
  );
  return rows;
}

async function getBookById(bookId) {
  const [rows] = await pool.execute(`SELECT * FROM book WHERE book_id = ?`, [bookId]);
  return rows[0] || null;
}

async function getBookDetails(bookId) {
  const book = await getBookById(bookId);
  if (!book) return null;

  const [authors] = await pool.execute(
    `SELECT a.author_name
     FROM author a
     JOIN book_author ba ON ba.author_id = a.author_id
     WHERE ba.book_id = ?`,
    [bookId]
  );

  const [keywords] = await pool.execute(
    `SELECT k.keyword_text
     FROM keyword k
     JOIN book_keyword bk ON bk.keyword_id = k.keyword_id
     WHERE bk.book_id = ?`,
    [bookId]
  );

  return {
    ...book,
    authors: authors.map((row) => row.author_name),
    keywords: keywords.map((row) => row.keyword_text),
  };
}

async function createBook(data) {
  const {
    title, isbn, publisher, publication_date, edition_number, language,
    book_type, purchase_option, format, price, quantity, category, subcategory
  } = data;

  const [result] = await pool.execute(
    `INSERT INTO book
     (title, isbn, publisher, publication_date, edition_number, language, book_type, purchase_option, format, price, quantity, category, subcategory)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [title, isbn || null, publisher || null, publication_date || null, edition_number || null, language || null,
     book_type || null, purchase_option || null, format || null, price || 0, quantity || 0, category || null, subcategory || null]
  );
  return result.insertId;
}

async function updateBook(bookId, data) {
  const fields = [
    'title', 'isbn', 'publisher', 'publication_date', 'edition_number', 'language',
    'book_type', 'purchase_option', 'format', 'price', 'quantity', 'category', 'subcategory'
  ];
  const setClause = fields.map((field) => `${field} = ?`).join(', ');
  const values = fields.map((field) => (data[field] !== undefined ? data[field] : null));
  values.push(bookId);

  await pool.execute(`UPDATE book SET ${setClause} WHERE book_id = ?`, values);
}

async function deleteBook(bookId) {
  await pool.execute(`DELETE FROM book WHERE book_id = ?`, [bookId]);
}

async function addAuthorsForBook(bookId, authors = []) {
  for (const authorName of authors) {
    if (!authorName) continue;
    const [existing] = await pool.execute(`SELECT author_id FROM author WHERE author_name = ?`, [authorName.trim()]);
    let authorId = existing[0]?.author_id;
    if (!authorId) {
      const [inserted] = await pool.execute(`INSERT INTO author (author_name) VALUES (?)`, [authorName.trim()]);
      authorId = inserted.insertId;
    }
    await pool.execute(`INSERT IGNORE INTO book_author (book_id, author_id) VALUES (?, ?)`, [bookId, authorId]);
  }
}

async function addKeywordsForBook(bookId, keywords = []) {
  for (const keywordText of keywords) {
    if (!keywordText) continue;
    const [existing] = await pool.execute(`SELECT keyword_id FROM keyword WHERE keyword_text = ?`, [keywordText.trim()]);
    let keywordId = existing[0]?.keyword_id;
    if (!keywordId) {
      const [inserted] = await pool.execute(`INSERT INTO keyword (keyword_text) VALUES (?)`, [keywordText.trim()]);
      keywordId = inserted.insertId;
    }
    await pool.execute(`INSERT IGNORE INTO book_keyword (book_id, keyword_id) VALUES (?, ?)`, [bookId, keywordId]);
  }
}

async function addBookToCourseOffering({ offering_id, book_id, added_by_admin_id, required_or_recommended }) {
  await pool.execute(
    `INSERT INTO course_book (offering_id, book_id, added_by_admin_id, required_or_recommended)
     VALUES (?, ?, ?, ?)`,
    [offering_id, book_id, added_by_admin_id, required_or_recommended || null]
  );
}

module.exports = {
  listBooks,
  getBookById,
  getBookDetails,
  createBook,
  updateBook,
  deleteBook,
  addAuthorsForBook,
  addKeywordsForBook,
  addBookToCourseOffering,
};
