/**
 * @fileoverview File per la definizione degli schemi di validazione per le aree vietate tramite Zod
 */
import { z } from 'zod';

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

export type CreateForbiddenAreaInput = z.infer<typeof createForbiddenAreaSchema>;
export type UpdateForbiddenAreaInput = z.infer<typeof updateForbiddenAreaSchema>;