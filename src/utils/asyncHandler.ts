import { Request, Response, NextFunction, RequestHandler } from "express";

/**
 * @description Async Function Handler using Promises.
 */
export const asyncHandler = (
    requestHandler: (
        req: Request,
        res: Response,
        next: NextFunction
    ) => Promise<any>
): RequestHandler => {
    return (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next)).catch(next);
    };
};

/**
 * @description Optional: Async Function Handler using try-catch logic.
 */
// export const asyncHandler = (
//   fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
// ): RequestHandler => async (req, res, next) => {
//   try {
//     await fn(req, res, next);
//   } catch (err: any) {
//     res.status(err.code || 500).json({
//       success: false,
//       message: err.message || "Something went wrong",
//     });
//   }
// };
