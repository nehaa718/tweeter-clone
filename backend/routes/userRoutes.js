const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure 'uploads/' exists
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Multer storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) =>
    cb(null, `profile-pic-${Date.now()}${path.extname(file.originalname)}`)
});

const upload = multer({ storage });
router.get('/profile', authMiddleware, userController.getCurrentUserProfile);
router.get('/:id', userController.getUser);

// Edit profile
router.put('/:id', authMiddleware, userController.editUser);

router.put(
  '/:id/uploadProfilePic', 
  authMiddleware,
  upload.single('profilePic'),
  userController.uploadProfilePic
);

router.post('/:id/follow', authMiddleware, userController.followUser);
router.post('/:id/unfollow', authMiddleware, userController.unfollowUser);


module.exports = router;
