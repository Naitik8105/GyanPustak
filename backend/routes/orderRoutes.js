const router = require('express').Router();
const orderController = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');
const { restrictTo } = require('../middleware/roleMiddleware');

router.post('/checkout', protect, restrictTo('student'), orderController.checkout);
router.get('/', protect, restrictTo('student'), orderController.myOrders);
router.get('/all', protect, restrictTo('customer_support', 'super_admin'), orderController.allOrders);
router.get('/:id', protect, orderController.orderDetails);
router.put('/:id/status', protect, restrictTo('customer_support', 'super_admin'), orderController.updateStatus);
router.put('/:id/items/:bookId/return', protect, restrictTo('student', 'customer_support', 'super_admin'), orderController.returnRentalBook);
module.exports = router;