const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middleware/authMiddleware');
const { allowRoles } = require('../middleware/roleMiddleware');

router.post(
  '/employees',
  authMiddleware.protect,   
  allowRoles('super_admin'),
  adminController.createEmployee
);

module.exports = router;