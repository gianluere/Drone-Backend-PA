import { z } from 'zod';
import { PlanStatus } from '../models/NavigationPlan';

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

export const reviewPlanSchema = z.object({
  status: z.enum(['accepted', 'rejected']),
  rejectionReason: z.string().min(1, 'La motivazione è obbligatoria').optional(),
}).refine(
  (data) => data.status !== 'rejected' || data.rejectionReason,
  { message: 'La motivazione è obbligatoria quando si rigetta un piano', path: ['rejectionReason'] }
);

const latitudeSchema = z.number({ error: 'Latitudine deve essere un numero' })
  .min(-90, 'Latitudine deve essere compresa tra -90 e 90')
  .max(90, 'Latitudine deve essere compresa tra -90 e 90');

const longitudeSchema = z.number({ error: 'Longitudine deve essere un numero' })
  .min(-180, 'Longitudine deve essere compresa tra -180 e 180')
  .max(180, 'Longitudine deve essere compresa tra -180 e 180');

export const createForbiddenAreaSchema = z.object({
  name: z.string({ error: 'Nome obbligatorio' }).min(1, 'Nome obbligatorio'),
  description: z.string().optional(),
  latMin: latitudeSchema,
  lonMin: longitudeSchema,
  latMax: latitudeSchema,
  lonMax: longitudeSchema,
}).refine(
  (data) => data.latMin < data.latMax,
  { message: 'latMin deve essere minore di latMax', path: ['latMin'] }
).refine(
  (data) => data.lonMin < data.lonMax,
  { message: 'lonMin deve essere minore di lonMax', path: ['lonMin'] }
);


export const updateForbiddenAreaSchema = z.object({
  name: z.string().min(1, 'Nome non può essere vuoto').optional(),
  description: z.string().optional(),
  latMin: latitudeSchema.optional(),
  lonMin: longitudeSchema.optional(),
  latMax: latitudeSchema.optional(),
  lonMax: longitudeSchema.optional()
}).refine(
  (data) => !data.latMin || !data.latMax || data.latMin < data.latMax,
  { message: 'latMin deve essere minore di latMax', path: ['latMin'] }
).refine(
  (data) => !data.lonMin || !data.lonMax || data.lonMin < data.lonMax,
  { message: 'lonMin deve essere minore di lonMax', path: ['lonMin'] }
);


/*export const listPlansSchema = z.object({
  status: z.enum(PlanStatus).optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  format: z.enum(['json', 'pdf']).optional().default('json'),
});*/

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ReviewPlanInput = z.infer<typeof reviewPlanSchema>;
export type CreateForbiddenAreaInput = z.infer<typeof createForbiddenAreaSchema>;
export type UpdateForbiddenAreaInput = z.infer<typeof updateForbiddenAreaSchema>;

//export type ListPlansInput = z.infer<typeof listPlansSchema>;