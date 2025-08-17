import express from 'express';
import protectRoute from '../middleware/protectRoute.js';

import {
  getUserProfile,
  toggleFollowUser,
  getSuggestedUsers,
  updateUserProfile,
  getUserFollowers,
  getUserFollowing,
  searchUsers,
  getCurrentUserFollowing,
} from '../controllers/user.controller.js';

const router = express.Router();

router.get('/profile/:username', protectRoute, getUserProfile);
router.get('/suggested', protectRoute, getSuggestedUsers);
router.get('/search', protectRoute, searchUsers);
router.get('/following', protectRoute, getCurrentUserFollowing); // Lấy following của user hiện tại
router.get('/following/:username', protectRoute, getUserFollowing); // Lấy following của user cụ thể
router.get('/followers/:username', protectRoute, getUserFollowers);
router.post('/follow/:id', protectRoute, toggleFollowUser);
router.post('/update', protectRoute, updateUserProfile);

export default router;
