import { Router } from 'express';
import * as healthController from '../controllers/health.controller';

const router = Router();

router.get('/health', healthController.health);
router.get('/ready', healthController.readiness);

export default router;
