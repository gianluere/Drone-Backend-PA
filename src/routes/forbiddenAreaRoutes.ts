import { Router } from 'express';
import * as forbiddenAreaController from '../controllers/forbiddenAreaController';
import { checkAndVerifyJWT } from '../middleware/JWTAuth';
import { checkRole } from '../middleware/checkRole';
import { zodValidate } from '../middleware/zodValidator';
import { createForbiddenAreaSchema } from '../validation/validator';
//import * as ForibiddenAreaService from '../services/forbiddenAreaServices';

const router = Router();
//const forbiddenAreaController = new ForbiddenAreaController(new ForbiddenAreaService());

//router.get('/', forbiddenAreaController.getForbiddenAreas);
router.get('/', forbiddenAreaController.getForbiddenArea);

router.post('/create-forbidden-area', checkAndVerifyJWT, checkRole('operator'), zodValidate(createForbiddenAreaSchema), forbiddenAreaController.createForbiddenArea);

export default router;