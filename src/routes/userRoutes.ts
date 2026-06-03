/**
 * @fileoverview Definisce le rotte per la gestione degli utenti, inclusi login, registrazione e ricarica dei token.
 * Utilizza middleware per la validazione dei dati, l'autenticazione JWT e il controllo dei ruoli. 
 */

import { Router } from 'express';
import * as userController from '../controllers/userController';
import { checkAndVerifyJWT } from '../middleware/JWTAuth';
import { checkRole } from '../middleware/checkRole';
import { zodValidate } from '../middleware/zodValidator';
import { chargeTokensSchema, loginSchema, registerSchema } from '../validation/validator';

const router = Router();

/**
 * @route POST /api/users/login
 * Questa rotta gestisce il login degli utenti.
 * Richiede un corpo JSON con email e password, valida i dati con Zod e chiama il controller per eseguire il login.
 */
router.post('/login', zodValidate(loginSchema), userController.login);

/**
 * @route POST /api/users/register
 * Questa rotta gestisce la registrazione dei nuovi utenti.
 * Richiede un corpo JSON con email, password e ruolo, valida i dati con Zod e chiama il controller per eseguire la registrazione.
 */
router.post('/register', zodValidate(registerSchema), userController.register);

/**
 * @route PATCH /api/users/charge-tokens
 * Questa rotta gestisce la ricarica dei token per un utente specifico.
 * Richiede autenticazione JWT, verifica che l'utente abbia il ruolo di admin.
 * Valida i dati con Zod e chiama il controller per eseguire la ricarica dei token.
 */
router.patch('/charge-tokens', checkAndVerifyJWT, checkRole('admin'), zodValidate(chargeTokensSchema), userController.chargeTokens);

export default router;