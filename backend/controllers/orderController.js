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

async function orderDetails(req, res) {
  try {
    const data = await orderModel.getOrderDetails(req.params.id);
    if (!data) return res.status(404).json({ message: 'Order not found' });
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

module.exports = { checkout, myOrders, orderDetails };
