const router = require('express').Router();
const employeeController = require('../controllers/employeeController');
const { protect } = require('../middleware/authMiddleware');
const { restrictTo } = require('../middleware/roleMiddleware');

router.get('/', protect, restrictTo('administrator', 'super_admin'), employeeController.listEmployees);
router.get('/search', protect, restrictTo('administrator', 'super_admin', 'customer_support'), employeeController.searchEmployees);

module.exports = router;