/**
 * @fileoverview Definisce le rotte per la gestione dei piani di navigazione, inclusa la creazione, la revisione e l'eliminazione dei piani.
 * Utilizza middleware per la validazione dei dati, l'autenticazione JWT e il controllo dei ruoli. 
 */

import { Router } from 'express';
import { checkAndVerifyJWT } from '../middleware/JWTAuth';
import { checkRole } from '../middleware/checkRole';
import * as navigationPlanController from '../controllers/navigationPlanController';
import { createNavigationPlanSchema, reviewNavigationPlanSchema } from '../validation/navigationPlanValidator';
import { zodValidate } from '../middleware/zodValidator';

const router = Router();

/**
 * @route GET /api/plans
 * Questa rotta restituisce la lista di tutti i piani di navigazione dell'utente autenticato.
 * Richiede autenticazione JWT e verifica che l'utente abbia il ruolo di 'user'.
 * Chiama il controller per ottenere la lista dei piani di navigazione.
 * È possibile inviare query parameters per filtrare i piani di navigazione in base allo stato, alla data di inizio, alla data di fine e al tipo di formato.
 * Esempio di query parameters: /api/plans?status=accepted&dateFrom=2024-01-01&dateTo=2024-12-31&format=pdf
 */
router.get('/', checkAndVerifyJWT, checkRole('user', 'operator'), navigationPlanController.listNavigationPlans);

/**
 * @route POST /api/plans/create-navigation-plan
 * Questa rotta gestisce la creazione di un nuovo piano di navigazione.
 * Richiede autenticazione JWT e verifica che l'utente abbia il ruolo di 'user'.
 * Valida i dati del piano di navigazione con Zod e chiama il controller per creare il piano di navigazione.
 */
router.post('/create-navigation-plan', checkAndVerifyJWT, checkRole('user'), zodValidate(createNavigationPlanSchema), navigationPlanController.createNavigationPlan);

/**
 * @route DELETE /api/plans/delete-navigation-plan/:id
 * Questa rotta gestisce l'eliminazione di un piano di navigazione esistente.
 * Richiede autenticazione JWT e verifica che l'utente abbia il ruolo di 'user'.
 * Chiama il controller per eliminare il piano di navigazione specificato dall'ID.
 */
router.delete('/delete-navigation-plan/:id', checkAndVerifyJWT, checkRole('user'), navigationPlanController.deleteNavigationPlan);


/**
 * @route GET /api/plans/:status
 * Questa rotta restituisce la lista dei piani di navigazione filtrati per stato.
 * Richiede autenticazione JWT e verifica che l'utente abbia il ruolo di 'operator'.
 * Chiama il controller per ottenere la lista dei piani di navigazione filtrati.
 */
//router.get('/', checkAndVerifyJWT, checkRole('operator'), navigationPlanController.listNavigationPlans);

/**
 * @route PATCH /api/plans/:id/review
 * Questa rotta gestisce la revisione di un piano di navigazione esistente.
 * Richiede autenticazione JWT e verifica che l'utente abbia il ruolo di 'operator'.
 * Valida i dati della revisione con Zod e chiama il controller per aggiornare lo stato del piano di navigazione specificato dall'ID.
 */
router.patch('/:id/review', checkAndVerifyJWT, checkRole('operator'), zodValidate(reviewNavigationPlanSchema), navigationPlanController.reviewNavigationPlan);


export default router;