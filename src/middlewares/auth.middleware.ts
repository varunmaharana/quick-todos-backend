import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import { User } from "../models/user.model";

export const verifyJWT = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            // Getting access token from cookie OR Authorization header from frontend
            const token =
                req.cookies?.accessToken ||
                req.header("Authorization")?.replace("Bearer ", "");

            if (!token) {
                throw new ApiError({
                    statusCode: 401,
                    message: "Unauthorized request!",
                });
            }

            // Verifying token using jwt
            const decodedToken = jwt.verify(
                token,
                process.env.ACCESS_TOKEN_SECRET as string
            );

            if (typeof decodedToken === "string" || !("_id" in decodedToken)) {
                throw new ApiError({
                    statusCode: 401,
                    message: "Invalid token!",
                });
            }

            const user = await User.findById(decodedToken?._id).select(
                "-password -refreshToken"
            );

            if (!user) {
                throw new ApiError({
                    statusCode: 404,
                    message: "User not found!",
                });
            }

            (req as any).user = user;

            next();
        } catch (error) {
            const err = error as Error;
            throw new ApiError({
                statusCode: 401,
                message: err?.message || "Invalid access token",
            });
        }
    }
);
