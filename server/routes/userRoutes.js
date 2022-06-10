const router = require('express').Router();
const { registerUser, authUser, allUsers, setAvatar } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', registerUser);
router.post('/login', authUser);
router.get('/', protect, allUsers);
router.put('/setAvatar', protect, setAvatar);

module.exports = router;