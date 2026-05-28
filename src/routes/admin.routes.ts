import { Router } from 'express';
import * as adminController from '../controllers/admin.controller';
import { masterKeyAuth } from '../middleware/masterKeyAuth';
import { validate } from '../middleware/validate';
import { createApiKeySchema, revokeApiKeySchema } from '../validators/notification.validator';

const router = Router();

router.use(masterKeyAuth);

router.post('/api-keys', validate(createApiKeySchema), adminController.createApiKey);
router.delete('/api-keys', validate(revokeApiKeySchema), adminController.revokeApiKey);
router.get('/api-keys', adminController.listApiKeys);

export default router;
