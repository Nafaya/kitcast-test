import { Router } from 'express';
import controllers from '../controllers/tasks';

const router = Router();

router.post('/tasks', controllers.create);
router.get('/tasks', controllers.list);

export default router;
