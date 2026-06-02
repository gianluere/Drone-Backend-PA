import { Router } from 'express';
import * as forbiddenAreaController from '../controllers/forbiddenAreaController';
import { checkAndVerifyJWT } from '../middleware/JWTAuth';
import { checkRole } from '../middleware/checkRole';
import { zodValidate } from '../middleware/zodValidator';
import { createForbiddenAreaSchema, updateForbiddenAreaSchema } from '../validation/validator';
//import * as ForibiddenAreaService from '../services/forbiddenAreaServices';

const router = Router();
//const forbiddenAreaController = new ForbiddenAreaController(new ForbiddenAreaService());

//router.get('/', forbiddenAreaController.getForbiddenAreas);
router.get('/', forbiddenAreaController.getForbiddenArea);

router.post('/create-forbidden-area', checkAndVerifyJWT, checkRole('operator'), zodValidate(createForbiddenAreaSchema), forbiddenAreaController.createForbiddenArea);

router.put('/update-forbidden-area/:id', checkAndVerifyJWT, checkRole('operator'), zodValidate(updateForbiddenAreaSchema), forbiddenAreaController.updateForbiddenArea);

router.delete('/delete-forbidden-area/:id', checkAndVerifyJWT, checkRole('operator'), forbiddenAreaController.deleteForbiddenArea);

export default router;