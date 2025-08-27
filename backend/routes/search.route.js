import express from 'express';
import protectRoute from '../middleware/protectRoute.js';

import { searchUsers, searchVacations } from '../controllers/search.controller.js';

const router = express.Router();

router.get('/', protectRoute, searchUsers);
router.get('/vacations', protectRoute, searchVacations);

export default router;
