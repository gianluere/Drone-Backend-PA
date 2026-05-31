import { Router } from 'express';
import * as userController from '../controllers/userController';
import { checkAndVerifyJWT } from '../middleware/JWTAuth';
import { checkRole } from '../middleware/checkRole';
//import { listPlansSchema } from '../validation/validator';
import * as navigationPlanController from '../controllers/navigationPlanController';

const router = Router();

router.get('/', checkAndVerifyJWT, checkRole('user'), navigationPlanController.listNavigationPlans);
//router.get('/prova', checkAndVerifyJWT, checkRole('user'), userController.prova)

//router.post('/register', zodValidate(registerSchema), userController.register);

export default router;