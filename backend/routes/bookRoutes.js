const router = require('express').Router();
const bookController = require('../controllers/bookController');
const { protect } = require('../middleware/authMiddleware');
const { restrictTo } = require('../middleware/roleMiddleware');

router.get('/', protect, bookController.listBooks);
router.get('/:id', protect, bookController.getBook);
router.post('/', protect, restrictTo('administrator', 'super_admin'), bookController.createBook);
router.put('/:id', protect, restrictTo('administrator', 'super_admin'), bookController.updateBook);
router.delete('/:id', protect, restrictTo('administrator', 'super_admin'), bookController.deleteBook);
router.post('/:id/course-offering', protect, restrictTo('administrator', 'super_admin'), bookController.addBookToCourseOffering);

module.exports = router;
