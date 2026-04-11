const router = require('express').Router();
const cartController = require('../controllers/cartController');
const { protect } = require('../middleware/authMiddleware');
const { restrictTo } = require('../middleware/roleMiddleware');

router.get('/', protect, restrictTo('student'), cartController.getMyCart);
router.post('/items', protect, restrictTo('student'), cartController.addItem);
router.put('/items/:bookId', protect, restrictTo('student'), cartController.updateItem);
router.delete('/items/:bookId', protect, restrictTo('student'), cartController.removeItem);

module.exports = router;
