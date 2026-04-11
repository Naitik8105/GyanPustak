const pool = require('../config/db');

async function ensureCart(studentId) {
  const [existing] = await pool.execute(`SELECT * FROM cart WHERE student_id = ?`, [studentId]);
  if (existing.length) return existing[0];

  const [result] = await pool.execute(`INSERT INTO cart (student_id) VALUES (?)`, [studentId]);
  return { cart_id: result.insertId, student_id: studentId };
}

async function getCartWithItems(studentId) {
  const cart = await ensureCart(studentId);
  const [items] = await pool.execute(
    `SELECT ci.book_id, ci.quantity, b.title, b.price, b.quantity AS stock_quantity
     FROM cart_item ci
     JOIN book b ON b.book_id = ci.book_id
     WHERE ci.cart_id = ?`,
    [cart.cart_id]
  );
  return { cart, items };
}

async function addToCart(studentId, bookId, quantity) {
  const cart = await ensureCart(studentId);
  const [existing] = await pool.execute(
    `SELECT quantity FROM cart_item WHERE cart_id = ? AND book_id = ?`,
    [cart.cart_id, bookId]
  );

  if (existing.length) {
    await pool.execute(
      `UPDATE cart_item SET quantity = quantity + ? WHERE cart_id = ? AND book_id = ?`,
      [quantity, cart.cart_id, bookId]
    );
  } else {
    await pool.execute(
      `INSERT INTO cart_item (cart_id, book_id, quantity) VALUES (?, ?, ?)`,
      [cart.cart_id, bookId, quantity]
    );
  }
}

async function updateCartItem(studentId, bookId, quantity) {
  const [cartRows] = await pool.execute(`SELECT cart_id FROM cart WHERE student_id = ?`, [studentId]);
  if (!cartRows.length) return;
  await pool.execute(
    `UPDATE cart_item SET quantity = ? WHERE cart_id = ? AND book_id = ?`,
    [quantity, cartRows[0].cart_id, bookId]
  );
}

async function removeCartItem(studentId, bookId) {
  const [cartRows] = await pool.execute(`SELECT cart_id FROM cart WHERE student_id = ?`, [studentId]);
  if (!cartRows.length) return;
  await pool.execute(`DELETE FROM cart_item WHERE cart_id = ? AND book_id = ?`, [cartRows[0].cart_id, bookId]);
}

module.exports = {
  ensureCart,
  getCartWithItems,
  addToCart,
  updateCartItem,
  removeCartItem,
};
