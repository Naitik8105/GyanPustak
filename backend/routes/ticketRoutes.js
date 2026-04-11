const router = require('express').Router();
const ticketController = require('../controllers/ticketController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, ticketController.createTicket);
router.get('/', protect, ticketController.listTickets);
router.put('/:id/status', protect, ticketController.changeStatus);
router.get('/:id/history', protect, ticketController.history);

module.exports = router;
