import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
import { StatusCodes } from 'http-status-codes';

export const zodValidate = (schema: ZodSchema) =>
    (req: Request, res: Response, next: NextFunction): void => {
        const result = schema.safeParse(req.body);
        console.log(result);

        if (!result.success) {

            res.status(StatusCodes.BAD_REQUEST).json({
                success: false,
                errors: result.error.issues.map(e => ({
                    field: e.path.join('.'),
                    message: e.message,
                })),
            });
            return;
        }

        req.body = result.data;
        next();
    };