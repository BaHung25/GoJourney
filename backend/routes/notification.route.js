import express from 'express';
import protectRoute from '../middleware/protectRoute.js';

const router = express.Router();

import {
  getNotifications,
  deleteNotifications,
  deleteNotification,
} from '../controllers/notification.controller.js';

router.get('/', protectRoute, getNotifications);
router.delete('/', protectRoute, deleteNotifications);
router.delete('/:id', protectRoute, deleteNotification);

export default router;
