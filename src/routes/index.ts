import { Router } from 'express';
import healthRoutes from './health.routes';
import notificationRoutes from './notification.routes';
import adminRoutes from './admin.routes';

const router = Router();

router.use(healthRoutes);
router.use('/v1/notifications', notificationRoutes);
router.use('/v1/admin', adminRoutes);

export default router;
