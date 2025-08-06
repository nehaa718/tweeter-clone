const User = require('../models/user');
const fs = require('fs');
const path = require('path');
const multer = require('multer');

//  Multer Setup
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '..', 'uploads');
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  },
});
const upload = multer({ storage });
exports.upload = upload.single('profilePic');

//Get My Profile
exports.getCurrentUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('followers following');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

//Get Other User Profile 
exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate('followers following');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Edit Profile 
exports.editUser = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId);

    if (!user) return res.status(404).json({ message: 'User not found' });

    // Update fields
    user.name = req.body.name || user.name;
    user.location = req.body.location || user.location;
    user.dob = req.body.dob || user.dob; 

    await user.save();

    // Return updated user
    res.status(200).json({
      _id: user._id,
      name: user.name,
      username: user.username,
      email: user.email,
      profilePic: user.profilePic,
      location: user.location,
      dob: user.dob,
      createdAt: user.createdAt,
      followers: user.followers,
      following: user.following,
    });
  } catch (err) {
    console.error('Edit profile error:', err);
    res.status(500).json({ message: 'Something went wrong' });
  }
};



// Upload Profile Pic
exports.uploadProfilePic = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Profile picture is required' });
    }

    const profilePicPath = `/uploads/${req.file.filename}`;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { profilePic: profilePicPath },
      { new: true }
    ).select('-password');

    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

//  Follow
exports.followUser = async (req, res) => {
  try {
    if (req.user._id.toString() === req.params.id) {
      return res.status(400).json({ message: 'You cannot follow yourself' });
    }

    const userToFollow = await User.findById(req.params.id);
    const currentUser = await User.findById(req.user._id);

    if (!userToFollow || !currentUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (currentUser.following.includes(userToFollow._id)) {
      return res.status(400).json({ message: 'Already following this user' });
    }

    currentUser.following.push(userToFollow._id);
    userToFollow.followers.push(currentUser._id);

    await currentUser.save();
    await userToFollow.save();

    res.json({ message: 'User followed successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Unfollow 
exports.unfollowUser = async (req, res) => {
  try {
    if (req.user._id.toString() === req.params.id) {
      return res.status(400).json({ message: 'You cannot unfollow yourself' });
    }

    const userToUnfollow = await User.findById(req.params.id);
    const currentUser = await User.findById(req.user._id);

    if (!userToUnfollow || !currentUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    currentUser.following = currentUser.following.filter(
      id => id.toString() !== userToUnfollow._id.toString()
    );
    userToUnfollow.followers = userToUnfollow.followers.filter(
      id => id.toString() !== currentUser._id.toString()
    );

    await currentUser.save();
    await userToUnfollow.save();

    res.json({ message: 'User unfollowed successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
