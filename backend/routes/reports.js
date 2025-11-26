import express from 'express';
import {
  listReports,
  getStats,
  getReport,
  createReport,
  updateReport,
  updateStatus,
  deleteReport
} from '../controllers/reportController.js';
import { protect, authorizeAdminOrOwner } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import Report from '../models/Report.js';

const router = express.Router();

router.get('/', listReports);
router.get('/stats', getStats);
router.get('/:id', getReport);
router.post('/', protect, upload.array('images', 4), createReport);
router.put('/:id', protect, authorizeAdminOrOwner(Report), upload.array('images', 4), updateReport);
router.patch('/:id/status', protect, authorizeAdminOrOwner(Report), updateStatus);
router.delete('/:id', protect, authorizeAdminOrOwner(Report), deleteReport);

export default router;
