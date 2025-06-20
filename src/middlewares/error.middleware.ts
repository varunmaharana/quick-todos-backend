import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/ApiError";

export const errorHandler = (
    err: ApiError | Error,
    req: Request,
    res: Response,
    _next: NextFunction
) => {
    const statusCode = err instanceof ApiError ? err.statusCode : 500;
    const message = err.message || "Internal Server Error";

    res.status(statusCode).json({
        statusCode,
        message,
        data: null,
        success: false,
        errors: err instanceof ApiError ? err.errors : [],
        stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    });
};
