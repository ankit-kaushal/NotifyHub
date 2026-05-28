import { Router } from 'express';
import multer from 'multer';
import * as notificationController from '../controllers/notification.controller';
import * as templateController from '../controllers/template.controller';
import { apiKeyAuth } from '../middleware/apiKeyAuth';
import { validate } from '../middleware/validate';
import {
  listLogsSchema,
  sendBatchSchema,
  sendEmailSchema,
  sendWhatsAppMediaSchema,
  sendWhatsAppSchema,
} from '../validators/notification.validator';
import {
  createEmailTemplateSchema,
  templateIdParamSchema,
  updateEmailTemplateSchema,
} from '../validators/template.validator';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 15 * 1024 * 1024 } });

router.use(apiKeyAuth);

router.post('/templates', validate(createEmailTemplateSchema), templateController.createTemplate);
router.get('/templates', templateController.listTemplates);
router.get(
  '/templates/:templateId',
  validate(templateIdParamSchema, 'params'),
  templateController.getTemplate,
);
router.put(
  '/templates/:templateId',
  validate(templateIdParamSchema, 'params'),
  validate(updateEmailTemplateSchema),
  templateController.updateTemplate,
);
router.delete(
  '/templates/:templateId',
  validate(templateIdParamSchema, 'params'),
  templateController.deleteTemplate,
);

router.post('/email', validate(sendEmailSchema), notificationController.sendEmail);
router.post('/whatsapp', validate(sendWhatsAppSchema), notificationController.sendWhatsApp);
router.post(
  '/whatsapp/media',
  upload.single('file'),
  validate(sendWhatsAppMediaSchema),
  notificationController.sendWhatsAppMedia,
);
router.post('/batch', validate(sendBatchSchema), notificationController.sendBatch);
router.get('/logs', validate(listLogsSchema, 'query'), notificationController.listLogs);

export default router;
