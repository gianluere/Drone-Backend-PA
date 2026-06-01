import { Router } from 'express';
import { checkAndVerifyJWT } from '../middleware/JWTAuth';
import { checkRole } from '../middleware/checkRole';
//import { listPlansSchema } from '../validation/validator';
import * as navigationPlanController from '../controllers/navigationPlanController';
import { reviewPlanSchema } from '../validation/validator';
import { zodValidate } from '../middleware/zodValidator';

const router = Router();

router.get('/', checkAndVerifyJWT, checkRole('user'), navigationPlanController.listNavigationPlans);
router.post('/create-plan', checkAndVerifyJWT, checkRole('user'), navigationPlanController.createNavigationPlan);
router.delete('/delete-plan/:id', checkAndVerifyJWT, checkRole('user'), navigationPlanController.deleteNavigationPlan);

router.get('/:status', checkAndVerifyJWT, checkRole('operator'), navigationPlanController.listFilteredNavigationPlans);

router.patch('/:id/review', checkAndVerifyJWT, checkRole('operator'), zodValidate(reviewPlanSchema), navigationPlanController.reviewNavigationPlan);

//router.get('/prova', checkAndVerifyJWT, checkRole('user'), userController.prova)

//router.post('/register', zodValidate(registerSchema), userController.register);

export default router;