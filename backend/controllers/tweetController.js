const Tweet = require('../models/tweet');

// Create Tweet
exports.createTweet = async (req, res) => {
  try {
    const { content } = req.body;
    if (!content) return res.status(400).json({ message: 'Tweet content is required' });

    let imagePath = '';
    if (req.file) {
      imagePath = `/uploads/tweetImages/${req.file.filename}`;
    }

    const tweet = new Tweet({
      content,
      tweetedBy: req.user._id,
      image: imagePath,
    });

    await tweet.save();
    const populatedTweet = await Tweet.findById(tweet._id).populate('tweetedBy', '-password');

    res.status(201).json(populatedTweet);
  } catch (err) {
    console.error('Create Tweet Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get tweets by a specific user
exports.getTweetsByUser = async (req, res) => {
  try {
    const tweets = await Tweet.find({ tweetedBy: req.params.userId })
      .populate('tweetedBy', '-password')
      .sort({ createdAt: -1 });

    res.json(tweets);
  } catch (err) {
    console.error('Get User Tweets Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Like Tweet
exports.likeTweet = async (req, res) => {
  try {
    const tweet = await Tweet.findById(req.params.id);
    if (!tweet) return res.status(404).json({ message: 'Tweet not found' });

    if (tweet.likes.includes(req.user._id)) {
      return res.status(400).json({ message: 'Already liked this tweet' });
    }

    tweet.likes.push(req.user._id);
    await tweet.save();

    res.json({ message: 'Tweet liked' });
  } catch (err) {
    console.error('Like Tweet Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Dislike Tweet
exports.dislikeTweet = async (req, res) => {
  try {
    const tweet = await Tweet.findById(req.params.id);
    if (!tweet) return res.status(404).json({ message: 'Tweet not found' });

    tweet.likes = tweet.likes.filter(id => id.toString() !== req.user._id.toString());
    await tweet.save();

    res.json({ message: 'Tweet disliked' });
  } catch (err) {
    console.error('Dislike Tweet Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Reply to Tweet
exports.replyTweet = async (req, res) => {
  try {
    const { content } = req.body;
    if (!content) return res.status(400).json({ message: 'Reply content is required' });

    const parentTweet = await Tweet.findById(req.params.id);
    if (!parentTweet) return res.status(404).json({ message: 'Parent tweet not found' });

    const reply = new Tweet({
      content,
      tweetedBy: req.user._id,
      parent: parentTweet._id,
    });

    await reply.save();

    parentTweet.replies.push(reply._id);
    await parentTweet.save();

    const populatedReply = await Tweet.findById(reply._id).populate('tweetedBy', '-password');

    res.status(201).json({ tweetId: parentTweet._id, reply: populatedReply });
  } catch (err) {
    console.error('Reply Tweet Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get Single Tweet (with replies)
exports.getTweetById = async (req, res) => {
  try {
    const tweet = await Tweet.findById(req.params.id)
      .populate('tweetedBy', '-password')
      .populate('likes', '-password')
      .populate('retweetBy', '-password')
      .populate({
        path: 'replies',
        populate: {
          path: 'tweetedBy',
          select: '-password',
        }
      });

    if (!tweet) return res.status(404).json({ message: 'Tweet not found' });

    res.json(tweet);
  } catch (err) {
    console.error('Get Tweet Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get All Tweets
exports.getAllTweets = async (req, res) => {
  try {
    const tweets = await Tweet.find()
      .populate('tweetedBy', '-password')
      .populate('likes', '-password')
      .populate('retweetBy', '-password')
      .sort({ createdAt: -1 });

    res.json(tweets);
  } catch (err) {
    console.error('Get All Tweets Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete Tweet
exports.deleteTweet = async (req, res) => {
  try {
    const tweet = await Tweet.findById(req.params.id);
    if (!tweet) return res.status(404).json({ message: 'Tweet not found' });

    if (!req.user || tweet.tweetedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized to delete this tweet' });
    }

    await tweet.deleteOne();
    res.json({ message: 'Tweet deleted successfully' });
  } catch (err) {
    console.error('Delete Tweet Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Retweet
exports.retweet = async (req, res) => {
  try {
    const tweet = await Tweet.findById(req.params.id);
    if (!tweet) return res.status(404).json({ message: 'Tweet not found' });

    if (tweet.tweetedBy.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot retweet your own tweet' });
    }

    if (tweet.retweetBy.includes(req.user._id)) {
      return res.status(400).json({ message: 'Already retweeted' });
    }

    tweet.retweetBy.push(req.user._id);
    await tweet.save();

    res.json({ message: 'Tweet retweeted' });
  } catch (err) {
    console.error('Retweet Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
