import { Router } from 'express';
import * as forbiddenAreaController from '../controllers/forbiddenAreaController';
//import * as ForibiddenAreaService from '../services/forbiddenAreaServices';

const router = Router();
//const forbiddenAreaController = new ForbiddenAreaController(new ForbiddenAreaService());

//router.get('/', forbiddenAreaController.getForbiddenAreas);
router.get('/', forbiddenAreaController.getForbiddenArea);

export default router;