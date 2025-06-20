import { ZodSchema } from "zod";
import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/ApiError";

export const validate =
    (schema: ZodSchema) =>
    (req: Request, res: Response, next: NextFunction) => {
        const parsed = schema.safeParse(req.body);

        if (!parsed.success) {
            const errors = parsed.error.flatten().fieldErrors;
            const errorsArray = Object.entries(errors).map(([key, value]) => ({
                field: key,
                messages: value,
            }));
            return next(
                new ApiError({
                    statusCode: 400,
                    message: "Validation failed",
                    errors: errorsArray,
                })
            );
        }

        req.body = parsed.data;
        next();
    };
