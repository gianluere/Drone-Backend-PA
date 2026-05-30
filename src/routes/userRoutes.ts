import { Router } from 'express';
import * as userController from '../controllers/userController';
import { checkAndVerifyJWT } from '../middleware/JWTAuth';
import { checkRole } from '../middleware/checkRole';

const router = Router();

router.post('/login', userController.login);
router.get('/prova', checkAndVerifyJWT, checkRole('user'), userController.prova)

router.post('/register', userController.register);

export default router;