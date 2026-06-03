/**
 * @fileoverview File per la definizione degli schemi di validazione per i piani di navigazione tramite Zod
 */
import { z } from 'zod';

const latitudeSchema = z.number({ error: 'Latitudine deve essere un numero' })
  .min(-90, 'Latitudine deve essere compresa tra -90 e 90')
  .max(90, 'Latitudine deve essere compresa tra -90 e 90');

const longitudeSchema = z.number({ error: 'Longitudine deve essere un numero' })
  .min(-180, 'Longitudine deve essere compresa tra -180 e 180')
  .max(180, 'Longitudine deve essere compresa tra -180 e 180');

const waypointSchema = z.object({
  latitude: latitudeSchema,
  longitude: longitudeSchema,
  sequenceOrder: z.number({ error: 'sequenceOrder deve essere un numero' })
    .int('sequenceOrder deve essere un intero')
    .min(1, 'sequenceOrder deve essere maggiore di 0'),
});

export const createNavigationPlanSchema = z.object({
  vesselCode: z.string().length(10, 'vesselCode deve essere lungo esattamente 10 caratteri'),

  startDateTime: z.iso.datetime().transform((v) => new Date(v)),

  endDateTime: z.iso.datetime().transform((v) => new Date(v)),

  waypoints: z.array(waypointSchema)
    .min(3, 'waypoints deve contenere almeno 3 elementi'),
})
  .refine(
    (data) => {
      const first = data.waypoints[0];
      const last = data.waypoints[data.waypoints.length - 1];

      return (
        first.latitude === last.latitude &&
        first.longitude === last.longitude
      );
    },
    {
      message: 'Il primo e l\'ultimo waypoint devono coincidere per formare una rotta chiusa',
      path: ['waypoints']
    }
  )
  .refine(
    (data) =>
      data.endDateTime.getTime() >
      data.startDateTime.getTime(),
    {
      message: 'endDateTime deve essere successiva a startDateTime',
      path: ['endDateTime']
    }
  )
  .refine(
    (data) => data.startDateTime.getTime() > (new Date().getTime()),
    {
      message: 'startDateTime deve essere successiva alla data e ora attuale',
      path: ['startDateTime']
    }
  )
  .refine(
    (data) => {
      /*
      const now = new Date().getTime();
      console.log('startDateTime:', data.startDateTime.getTime());
      console.log('now:', now);
      return data.startDateTime.getTime() > (now + 48 * 60 * 60 * 1000);
      */
      const now = Date.now();
      const start = data.startDateTime.getTime();

      const diff = start - now;

      console.log({
        now: new Date(now).toISOString(),
        start: new Date(start).toISOString(),
        diffHours: diff / 3600000,
      });
      return diff >= 48 * 3600000;
    },
    {
      message: 'la richiesta deve essere effettuata almeno 48 ore prima dell\'inizio del piano di navigazione',
      path: ['startDateTime']
    }
  );

export const reviewNavigationPlanSchema = z.object({
  status: z.enum(['accepted', 'rejected']),
  rejectionReason: z.string().min(1, 'La motivazione è obbligatoria').optional(),
}).refine(
  (data) => data.status !== 'rejected' || data.rejectionReason,
  { message: 'La motivazione è obbligatoria quando si rigetta un piano', path: ['rejectionReason'] }
);

export type CreateNavigationPlanInput = z.infer<typeof createNavigationPlanSchema>;
export type ReviewNavigationPlanInput = z.infer<typeof reviewNavigationPlanSchema>;