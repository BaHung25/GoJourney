import express from 'express';
import protectRoute from '../middleware/protectRoute.js';
import { uploadMultiple } from '../middleware/upload.js';
import {
  createPost,
  deletePost,
  addCommentOnPost,
  toggleLikeOnPost,
  getAllPosts,
  getLikedPosts,
  getFollowingPosts,
  getUserPosts,
  getVacationFeed,
} from '../controllers/post.controller.js';

const router = express.Router();

router.get('/all', protectRoute, getAllPosts);
router.get('/likes/:id', protectRoute, getLikedPosts);
router.get('/following', protectRoute, getFollowingPosts);
router.get('/vacations', protectRoute, getVacationFeed);
router.get('/user/:username', protectRoute, getUserPosts);
router.post('/create', protectRoute, uploadMultiple, createPost);
router.post('/like/:id', protectRoute, toggleLikeOnPost);
router.post('/comment/:id', protectRoute, addCommentOnPost);
router.delete('/:id', protectRoute, deletePost);

export default router;
