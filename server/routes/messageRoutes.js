
const router = require('express').Router();
const { protect } = require('../middleware/authMiddleware');

const { sendMessage, allMessages} = require('../controllers/messageController.js');

router.post('/', protect, sendMessage);
router.get('/:chatID', protect, allMessages);


module.exports = router;