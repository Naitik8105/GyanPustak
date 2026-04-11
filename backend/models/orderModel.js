const pool = require('../config/db');

async function checkoutFromCart(studentId) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [cartRows] = await conn.execute(`SELECT cart_id FROM cart WHERE student_id = ?`, [studentId]);
    if (!cartRows.length) throw new Error('Cart not found');

    const cartId = cartRows[0].cart_id;

    const [items] = await conn.execute(
      `SELECT ci.book_id, ci.quantity, b.price
       FROM cart_item ci
       JOIN book b ON b.book_id = ci.book_id
       WHERE ci.cart_id = ?`,
      [cartId]
    );

    if (!items.length) throw new Error('Cart is empty');

    const [orderResult] = await conn.execute(
      `INSERT INTO orders (student_id, cart_id, order_status)
       VALUES (?, ?, ?)`,
      [studentId, cartId, 'new']
    );

    const orderId = orderResult.insertId;

    for (const item of items) {
      await conn.execute(
        `INSERT INTO order_item (order_id, book_id, quantity, unit_price_at_purchase)
         VALUES (?, ?, ?, ?)`,
        [orderId, item.book_id, item.quantity, item.price]
      );
    }

    await conn.execute(`DELETE FROM cart_item WHERE cart_id = ?`, [cartId]);

    await conn.commit();
    return orderId;
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
}

async function listOrdersByStudent(studentId) {
  const [orders] = await pool.execute(
    `SELECT * FROM orders WHERE student_id = ? ORDER BY order_id DESC`,
    [studentId]
  );
  return orders;
}

async function getOrderDetails(orderId) {
  const [orderRows] = await pool.execute(`SELECT * FROM orders WHERE order_id = ?`, [orderId]);
  if (!orderRows.length) return null;

  const [items] = await pool.execute(
    `SELECT oi.book_id, oi.quantity, oi.unit_price_at_purchase, b.title
     FROM order_item oi
     JOIN book b ON b.book_id = oi.book_id
     WHERE oi.order_id = ?`,
    [orderId]
  );

  return { order: orderRows[0], items };
}

module.exports = { checkoutFromCart, listOrdersByStudent, getOrderDetails };
