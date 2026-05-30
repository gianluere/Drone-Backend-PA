import { Router } from 'express';
import * as userController from '../controllers/userController';
import { checkAndVerifyJWT } from '../middleware/JWTAuth';
import { checkRole } from '../middleware/checkRole';
import { zodValidate } from '../middleware/zodValidator';
import { loginSchema, registerSchema } from '../validation/validator';

const router = Router();

router.post('/login', zodValidate(loginSchema), userController.login);
router.get('/prova', checkAndVerifyJWT, checkRole('user'), userController.prova)

router.post('/register', zodValidate(registerSchema), userController.register);

export default router;