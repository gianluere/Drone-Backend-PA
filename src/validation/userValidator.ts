/**
 * @fileoverview File per la definizione degli schemi di validazione per gli user tramite Zod
 */
import { z } from 'zod';

const passwordSchema = z
  .string({ error: 'Password obbligatoria' })
  .min(8, 'La password deve essere di almeno 8 caratteri')
  .regex(/[0-9]/, 'La password deve contenere almeno un numero')
  .regex(/[!@#$%^&*()_+\-=\[\]{};\':"\\|,.<>\/?]/, 'La password deve contenere almeno un carattere speciale');

export const loginSchema = z.object({
  email: z.email({ error: 'Email non valida' }).min(1, 'Email obbligatoria'),
  password: z.string({ error: 'Password obbligatoria' }).min(1, 'Password obbligatoria'),
});

export const registerSchema = z.object({
  email: z.email({ error: 'Email non valida' }),
  password: passwordSchema,
  role: z.enum(['user', 'operator', 'admin'], { error: 'Ruolo non valido, valori ammessi: user, operator, admin' }),
});

export const chargeTokensSchema = z.object({
  amount: z.number({ error: 'Amount deve essere un numero' })
    .positive('Amount deve essere un numero positivo')
    .int('Amount deve essere un numero intero'),
  userId: z.number({ error: 'User ID deve essere un numero' })
    .positive('User ID deve essere un numero positivo')
    .int('User ID deve essere un numero intero')
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ChargeTokensInput = z.infer<typeof chargeTokensSchema>;