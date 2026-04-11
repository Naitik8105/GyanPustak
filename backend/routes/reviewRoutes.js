const router = require('express').Router();
const reviewController = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');
const { restrictTo } = require('../middleware/roleMiddleware');

router.post('/', protect, restrictTo('student'), reviewController.addReview);
router.get('/book/:bookId', protect, reviewController.listBookReviews);

module.exports = router;
