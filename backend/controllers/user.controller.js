// modules
import bcrypt from 'bcryptjs';
import cloudinary from 'cloudinary';

// models
import User from '../models/user.model.js';
import Notification from '../models/notification.model.js';

const getUserProfile = async (req, res) => {
  const { username } = req.params;

  try {
    const user = await User.findOne({ username }).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json(user);
  } catch (error) {
    console.log('Error in getUserProfile ', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const toggleFollowUser = async (req, res) => {
  try {
    const { id: targetUserId } = req.params;
    const loggedInUserId = req.user._id;

    if (loggedInUserId.equals(targetUserId)) {
      return res
        .status(400)
        .json({ error: "You can't follow/unfollow yourself" });
    }

    // Fetch both users simultaneously
    const [loggedInUser, targetUser] = await Promise.all([
      User.findById(loggedInUserId),
      User.findById(targetUserId),
    ]);

    if (!loggedInUser || !targetUser)
      return res.status(404).json({ error: 'User not found' });

    const isFollowing = loggedInUser.following.includes(targetUserId);

    await User.bulkWrite([
      {
        updateOne: {
          filter: { _id: loggedInUserId }, // update loggedInUser
          update: isFollowing
            ? { $pull: { following: targetUserId } } // unfollow
            : { $push: { following: targetUserId } }, // follow
        },
      },
      {
        updateOne: {
          filter: { _id: targetUserId }, // update targetUser
          update: isFollowing
            ? { $pull: { followers: loggedInUserId } } // Remove follower
            : { $push: { followers: loggedInUserId } }, // add follower
        },
      },
    ]);

    if (!isFollowing) {
      const newNotification = new Notification({
        type: 'follow',
        from: loggedInUserId,
        to: targetUserId,
      });

      await newNotification.save();
    }

    res.status(200).json({
      message: isFollowing
        ? 'User unfollowed successfully'
        : 'User followed successfully',
    });
  } catch (error) {
    console.log('Error in toggleFollowUser controller', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getSuggestedUsers = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;

    const loggedInUser = await User.findById(loggedInUserId).select(
      'following'
    );
    const followingList = loggedInUser?.following || [];

    const suggestedUsers = await User.aggregate([
      {
        $match: {
          _id: { $ne: loggedInUserId, $nin: followingList },
        },
      },

      { $sample: { size: 4 } },

      { $project: { password: 0 } },
    ]);

    res.status(200).json(suggestedUsers);
  } catch (error) {
    console.log('Error in getSuggestedUsers controller ', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const updateUserProfile = async (req, res) => {
  try {
    const {
      username,
      email,
      fullName,
      currentPassword,
      newPassword,
      bio,
      link,
      profileImg,
      coverImg,
    } = req.body;

    const userId = req.user._id;

    let user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (
      (!currentPassword && newPassword) ||
      (currentPassword && !newPassword)
    ) {
      return res
        .status(400)
        .json({ error: 'Please provide both current and new password' });
    }

    if (currentPassword && newPassword) {
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ error: 'Current password is incorrect' });
      }

      if (newPassword.length < 6) {
        return res
          .status(400)
          .json({ error: 'Password must be at least 6 characters long' });
      }

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
    }

    // Handle Image Uploads
    if (profileImg) {
      if (user.profileImg) {
        await cloudinary.v2.uploader.destroy(
          user.profileImg.split('/').pop().split('.')[0]
        );
      }
      const uploadedProfile = await cloudinary.v2.uploader.upload(profileImg);
      user.profileImg = uploadedProfile.secure_url;
    }

    if (coverImg) {
      if (user.coverImg) {
        await cloudinary.v2.uploader.destroy(
          user.coverImg.split('/').pop().split('.')[0]
        );
      }
      const uploadedCover = await cloudinary.v2.uploader.upload(coverImg);
      user.coverImg = uploadedCover.secure_url;
    }

    // Update other fields
    user.fullName = fullName || user.fullName;
    user.email = email || user.email;
    user.username = username || user.username;
    user.bio = bio || user.bio;
    user.link = link || user.link;

    await user.save();

    user.password = null;

    res.status(200).json(user);
  } catch (error) {
    console.error('Error in updateUserProfile controller:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getUserFollowing = async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username }).populate(
      'following',
      'username fullName profileImg'
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.status(200).json(user.following);
  } catch (error) {
    console.log('Error in getUserFollowing controller', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getUserFollowers = async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username }).populate(
      'followers',
      'username fullName profileImg'
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.status(200).json(user.followers);
  } catch (error) {
    console.log('Error in getUserFollowers controller', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Tìm kiếm người dùng theo username hoặc fullName
const searchUsers = async (req, res) => {
  try {
    const { username, fullName } = req.query;
    
    if (!username && !fullName) {
      return res.status(400).json({ error: 'Phải cung cấp username hoặc fullName để tìm kiếm' });
    }

    let searchQuery = {};
    
    if (username && username.trim().length >= 2) {
      searchQuery.username = new RegExp(username.trim(), 'i');
    }
    
    if (fullName && fullName.trim().length >= 2) {
      searchQuery.fullName = new RegExp(fullName.trim(), 'i');
    }
    
    // Nếu có cả username và fullName, tìm kiếm OR
    if (username && fullName) {
      searchQuery = {
        $or: [
          { username: new RegExp(username.trim(), 'i') },
          { fullName: new RegExp(fullName.trim(), 'i') }
        ]
      };
    }

    const users = await User.find(searchQuery)
      .select('username fullName profileImg')
      .limit(20); // Giới hạn kết quả

    res.status(200).json(users);
  } catch (error) {
    console.log('Error in searchUsers controller:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Lấy danh sách following của user hiện tại đang đăng nhập
const getCurrentUserFollowing = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    
    const currentUser = await User.findById(currentUserId).populate(
      'following',
      'username fullName profileImg'
    );

    if (!currentUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Trả về trực tiếp array following thay vì object
    return res.status(200).json(currentUser.following || []);
  } catch (error) {
    console.log('Error in getCurrentUserFollowing controller:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export {
  getUserProfile,
  toggleFollowUser,
  getSuggestedUsers,
  updateUserProfile,
  getUserFollowing,
  getUserFollowers,
  searchUsers,
  getCurrentUserFollowing,
};
