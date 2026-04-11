const cartModel = require('../models/cartModel');

async function getMyCart(req, res) {
  try {
    const cart = await cartModel.getCartWithItems(req.user.id);
    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

async function addItem(req, res) {
  try {
    const { book_id, quantity } = req.body;
    await cartModel.addToCart(req.user.id, book_id, Number(quantity || 1));
    res.json({ message: 'Item added to cart' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

async function updateItem(req, res) {
  try {
    await cartModel.updateCartItem(req.user.id, req.params.bookId, Number(req.body.quantity));
    res.json({ message: 'Cart item updated' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

async function removeItem(req, res) {
  try {
    await cartModel.removeCartItem(req.user.id, req.params.bookId);
    res.json({ message: 'Cart item removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

module.exports = { getMyCart, addItem, updateItem, removeItem };
