const pool = require('../config/db');
const RENTAL_DAYS = 14;

function isRentalBook(purchaseOption) {
  return String(purchaseOption || '').trim().toLowerCase() === 'rent';
}

async function markOverdueRentals() {
  await pool.execute(
    `UPDATE order_item
     SET rental_status = 'overdue'
     WHERE is_rental = 1
       AND rental_status = 'rented'
       AND rental_due_date < NOW()`
  );
}

async function returnRentalItem(orderId, bookId, studentId) {
  const [rows] = await pool.execute(
    `SELECT oi.order_id, oi.book_id, oi.is_rental, oi.rental_status, o.student_id
     FROM order_item oi
     JOIN orders o ON o.order_id = oi.order_id
     WHERE oi.order_id = ? AND oi.book_id = ?`,
    [orderId, bookId]
  );

  if (!rows.length) throw new Error('Rental item not found');
  if (Number(rows[0].student_id) !== Number(studentId)) {
    throw new Error('Access denied');
  }
  if (!rows[0].is_rental) {
    throw new Error('This book is not rented');
  }
  if (rows[0].rental_status === 'returned') {
    throw new Error('Already returned');
  }

  await pool.execute(
    `UPDATE order_item
     SET rental_status = 'returned',
         rental_return_date = NOW()
     WHERE order_id = ? AND book_id = ?`,
    [orderId, bookId]
  );
}
const ALLOWED_ORDER_STATUSES = new Set([
  'new',
  'processed',
  'awaiting shipping',
  'shipped',
  'delivered',
  'canceled',
]);

function normalizeStatus(status) {
  return String(status || '').trim().toLowerCase();
}

function validateStatus(status) {
  const normalized = normalizeStatus(status);
  if (!ALLOWED_ORDER_STATUSES.has(normalized)) {
    throw new Error('Invalid order status');
  }
  return normalized;
}

function canTransition(currentStatus, nextStatus) {
  const current = normalizeStatus(currentStatus);
  const next = validateStatus(nextStatus);

  if (current === 'new') return ['processed', 'canceled'].includes(next);
  if (current === 'processed') return ['awaiting shipping', 'canceled'].includes(next);
  if (current === 'awaiting shipping') return ['shipped', 'canceled'].includes(next);
  if (current === 'shipped') return ['delivered'].includes(next);
  if (current === 'delivered' || current === 'canceled') return false;

  return false;
}

async function checkoutFromCart(studentId) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [cartRows] = await conn.execute(
      `SELECT cart_id FROM cart WHERE student_id = ?`,
      [studentId]
    );
    if (!cartRows.length) throw new Error('Cart not found');

    const cartId = cartRows[0].cart_id;

    const [items] = await conn.execute(
      `SELECT ci.book_id, ci.quantity, b.price, b.purchase_option
       FROM cart_item ci
       JOIN book b ON b.book_id = ci.book_id
       WHERE ci.cart_id = ?`,
      [cartId]
    );

    if (!items.length) throw new Error('Cart is empty');

    const [orderResult] = await conn.execute(
      `INSERT INTO orders (student_id, cart_id, order_status, date_created)
       VALUES (?, ?, ?, NOW())`,
      [studentId, cartId, 'new']
    );

    const orderId = orderResult.insertId;

    for (const item of items) {
      const rental = isRentalBook(item.purchase_option);
      const rentalStart = rental ? new Date() : null;
      const rentalDue = rental ? new Date(Date.now() + RENTAL_DAYS * 24 * 60 * 60 * 1000) : null;

      await conn.execute(
        `INSERT INTO order_item
         (order_id, book_id, quantity, unit_price_at_purchase,
          is_rental, rental_status, rental_start_date, rental_due_date, rental_return_date)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          orderId,
          item.book_id,
          item.quantity,
          item.price,
          rental ? 1 : 0,
          rental ? 'rented' : null,
          rentalStart,
          rentalDue,
          null,
        ]
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
  await markOverdueRentals();
  const [orders] = await pool.execute(
    `SELECT * FROM orders WHERE student_id = ? ORDER BY order_id DESC`,
    [studentId]
  );
  return orders;
}

async function listAllOrders() {
  await markOverdueRentals();
  const [orders] = await pool.execute(
    `SELECT
        o.order_id,
        o.student_id,
        p.first_name,
        p.last_name,
        p.email,
        o.cart_id,
        o.date_created,
        o.date_fulfilled,
        o.shipping_type,
        o.credit_card_holder_name,
        o.credit_card_type,
        o.order_status
     FROM orders o
     JOIN student s ON s.person_id = o.student_id
     JOIN person p ON p.person_id = s.person_id
     ORDER BY o.order_id DESC`
  );
  return orders;
}

async function getOrderDetails(orderId) {
  await markOverdueRentals();

  const [orderRows] = await pool.execute(`SELECT * FROM orders WHERE order_id = ?`, [orderId]);
  if (!orderRows.length) return null;

  const [items] = await pool.execute(
    `SELECT oi.book_id, oi.quantity, oi.unit_price_at_purchase, oi.is_rental,
            oi.rental_status, oi.rental_start_date, oi.rental_due_date, oi.rental_return_date,
            b.title, b.purchase_option
     FROM order_item oi
     JOIN book b ON b.book_id = oi.book_id
     WHERE oi.order_id = ?`,
    [orderId]
  );

  return { order: orderRows[0], items };
}

async function updateOrderStatus(orderId, nextStatus) {
  const [orderRows] = await pool.execute(
    `SELECT order_status FROM orders WHERE order_id = ?`,
    [orderId]
  );

  if (!orderRows.length) {
    throw new Error('Order not found');
  }

  const currentStatus = normalizeStatus(orderRows[0].order_status);
  const normalizedNextStatus = validateStatus(nextStatus);

  if (!canTransition(currentStatus, normalizedNextStatus)) {
    throw new Error(`Invalid status transition: ${currentStatus} -> ${normalizedNextStatus}`);
  }

  const shouldSetFulfilled =
    normalizedNextStatus === 'delivered' || normalizedNextStatus === 'canceled';

  await pool.execute(
    `UPDATE orders
     SET order_status = ?,
         date_fulfilled = ?
     WHERE order_id = ?`,
    [
      normalizedNextStatus,
      shouldSetFulfilled ? new Date() : null,
      orderId,
    ]
  );
}

module.exports = {
  checkoutFromCart,
  listOrdersByStudent,
  listAllOrders,
  getOrderDetails,
  updateOrderStatus,
  returnRentalItem,
  markOverdueRentals,
};