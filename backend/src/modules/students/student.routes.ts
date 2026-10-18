import { Router } from 'express';
import { studentController } from './student.controller';
import { authenticate, authorize } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { studentProfileSchema } from '../../shared';

const router = Router();

router.use(authenticate);
router.use(authorize('STUDENT'));

router.get('/profile', (req, res, next) => studentController.getProfile(req, res, next));
router.put('/profile', validate({ body: studentProfileSchema }), (req, res, next) =>
  studentController.updateProfile(req, res, next)
);
router.post('/skills', (req, res, next) => studentController.addSkill(req, res, next));
router.delete('/skills/:id', (req, res, next) => studentController.removeSkill(req, res, next));

export default router;
