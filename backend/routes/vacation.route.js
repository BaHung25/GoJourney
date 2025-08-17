import express from 'express';
const router = express.Router();
import protectRoute from '../middleware/protectRoute.js';
import { uploadSingle, uploadMultiple } from '../middleware/upload.js';
import {
  createVacation,
  getUserVacations,
  getVacationById,
  updateVacation,
  deleteVacation,
  addPostToVacation,
  removePostFromVacation,
  getPostsByVacation,
  inviteUserToVacation,
  acceptVacationInvitation,
  kickUserFromVacation,
} from '../controllers/vacation.controller.js';

// Tất cả routes đều yêu cầu đăng nhập
router.use(protectRoute);

// Tạo kỳ nghỉ mới - hỗ trợ multiple images
router.post('/', uploadMultiple, createVacation);

// Lấy danh sách kỳ nghỉ của người dùng - PHẢI ĐẶT TRƯỚC /:vacationId
router.get('/user', getUserVacations);

// Thêm bài viết vào kỳ nghỉ
router.post('/:vacationId/posts', addPostToVacation);

// Xóa bài viết khỏi kỳ nghỉ
router.delete('/:vacationId/posts/:postId', removePostFromVacation);

// Lấy bài viết của kỳ nghỉ
router.get('/:vacationId/posts', getPostsByVacation);

// Mời người dùng tham gia kỳ nghỉ
router.post('/:vacationId/invite', inviteUserToVacation);

// Chấp nhận lời mời tham gia kỳ nghỉ
router.post('/:vacationId/accept', acceptVacationInvitation);

// Loại thành viên khỏi kỳ nghỉ
router.delete('/:vacationId/participants/:userId', kickUserFromVacation);

// Lấy chi tiết kỳ nghỉ - PHẢI ĐẶT SAU CÁC ROUTES CỤ THỂ
router.get('/:vacationId', getVacationById);

// Cập nhật kỳ nghỉ - hỗ trợ multiple images
router.put('/:vacationId', uploadMultiple, updateVacation);

// Xóa kỳ nghỉ
router.delete('/:vacationId', deleteVacation);

export default router; 