/**
 * @fileoverview Definisce le rotte per la gestione delle aree proibite, inclusa la creazione, l'aggiornamento e l'eliminazione delle aree proibite.
 * Utilizza middleware per la validazione dei dati, l'autenticazione JWT e il controllo dei ruoli. 
 */

import { Router } from 'express';
import * as forbiddenAreaController from '../controllers/forbiddenAreaController';
import { checkAndVerifyJWT } from '../middleware/JWTAuth';
import { checkRole } from '../middleware/checkRole';
import { zodValidate } from '../middleware/zodValidator';
import { createForbiddenAreaSchema, updateForbiddenAreaSchema } from '../validation/forbiddenAreaValidator';


const router = Router();

/**
 * @route GET /api/forbidden-areas
 * Questa rotta restituisce la lista di tutte le aree proibite.
 * Non richiede autenticazione e può essere accessibile a chiunque.
 * Chiama il controller per ottenere la lista delle aree proibite.
 */
router.get('/', forbiddenAreaController.getForbiddenArea);

/**
 * @route POST /api/forbidden-areas/create-forbidden-area
 * Questa rotta gestisce la creazione di una nuova area proibita.
 * Richiede autenticazione JWT e verifica che l'utente abbia il ruolo di 'operator'.
 * Valida i dati dell'area proibita con Zod e chiama il controller per creare l'area proibita.
 */
router.post('/create-forbidden-area', checkAndVerifyJWT, checkRole('operator'), zodValidate(createForbiddenAreaSchema), forbiddenAreaController.createForbiddenArea);

/**
 * @route PATCH /api/forbidden-areas/update-forbidden-area/:id
 * Questa rotta gestisce l'aggiornamento di un'area proibita esistente.
 * Richiede autenticazione JWT e verifica che l'utente abbia il ruolo di 'operator'.
 * Valida i dati dell'area proibita con Zod e chiama il controller per aggiornare l'area proibita.
 */
router.patch('/update-forbidden-area/:id', checkAndVerifyJWT, checkRole('operator'), zodValidate(updateForbiddenAreaSchema), forbiddenAreaController.updateForbiddenArea);


/**
 * @route DELETE /api/forbidden-areas/delete-forbidden-area/:id
 * Questa rotta gestisce l'eliminazione di un'area proibita esistente.
 * Richiede autenticazione JWT e verifica che l'utente abbia il ruolo di 'operator'.
 * Chiama il controller per eliminare l'area proibita specificata dall'ID.
 */
router.delete('/delete-forbidden-area/:id', checkAndVerifyJWT, checkRole('operator'), forbiddenAreaController.deleteForbiddenArea);

export default router;