const router = require('express').Router();
const orderController = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');
const { restrictTo } = require('../middleware/roleMiddleware');

router.post('/checkout', protect, restrictTo('student'), orderController.checkout);
router.get('/', protect, restrictTo('student'), orderController.myOrders);
router.get('/:id', protect, restrictTo('student'), orderController.orderDetails);

module.exports = router;
