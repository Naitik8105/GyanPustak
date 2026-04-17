const orderModel = require('../models/orderModel');

async function checkout(req, res) {
  try {
    const orderId = await orderModel.checkoutFromCart(req.user.id);
    res.status(201).json({ message: 'Order placed', orderId });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

async function myOrders(req, res) {
  try {
    const orders = await orderModel.listOrdersByStudent(req.user.id);
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

async function allOrders(req, res) {
  try {
    const orders = await orderModel.listAllOrders();
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

async function orderDetails(req, res) {
  try {
    const data = await orderModel.getOrderDetails(req.params.id);
    if (!data) return res.status(404).json({ message: 'Order not found' });

    const role = req.user.role;

    if (role === 'student' && Number(data.order.student_id) !== Number(req.user.id)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

async function updateStatus(req, res) {
  try {
    await orderModel.updateOrderStatus(req.params.id, req.body.status);
    res.json({ message: 'Order status updated' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

async function returnRentalBook(req, res) {
  try {
    await orderModel.returnRentalItem(
      req.params.id,
      req.params.bookId,
      req.user.id
    );
    res.json({ message: 'Rental book returned successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

module.exports = { checkout, myOrders, allOrders, orderDetails, updateStatus, returnRentalBook };