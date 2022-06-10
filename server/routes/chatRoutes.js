const { protect } = require('../middleware/authMiddleware');
const { 
    accessChat, 
    fetchChats, 
    latestMessage,
    createGroupChat, 
    renameGroup,
    addToGroup,
    removeFromGroup
} = require('../controllers/chatController');
const router = require('express').Router();

router.post('/', protect, accessChat);
router.get('/', protect, fetchChats);
router.put('/updateLatestMessage', protect, latestMessage)
router.post('/group', protect, createGroupChat);
router.put('/rename', protect, renameGroup);
router.put('/groupAdd', protect, addToGroup);
router.put('/groupRemove', protect, removeFromGroup);

module.exports = router;