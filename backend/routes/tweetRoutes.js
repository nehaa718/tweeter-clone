const express = require('express');
const router = express.Router();
const tweetController = require('../controllers/tweetController');
const authMiddleware = require('../middlewares/authMiddleware');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Create uploads/tweetImages if it doesn't exist
const uploadDir = path.join(__dirname, '..', 'uploads', 'tweetImages');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// Multer setup
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  },
});
const upload = multer({ storage });

// Routes
router.post('/', authMiddleware, upload.single('image'), tweetController.createTweet);

router.post('/:id/like', authMiddleware, tweetController.likeTweet);
router.post('/:id/dislike', authMiddleware, tweetController.dislikeTweet);
router.post('/:id/reply', authMiddleware, tweetController.replyTweet);
router.post('/:id/retweet', authMiddleware, tweetController.retweet);

router.get('/user/:userId', authMiddleware, tweetController.getTweetsByUser);
router.get('/:id', authMiddleware, tweetController.getTweetById);
router.get('/', authMiddleware, tweetController.getAllTweets);
router.delete('/:id', authMiddleware, tweetController.deleteTweet);

module.exports = router;
