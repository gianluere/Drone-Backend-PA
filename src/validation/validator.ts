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
  role: z
    .enum(['user', 'operator', 'admin'])
    .optional()
    .default('user'),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;