import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { User, UserI } from "../models/user.model";
import { ApiError } from "../utils/ApiError";

// Dedicated function to generate both access and refresh tokens
const generateAccessAndRefreshTokens = async (userId: string) => {
    try {
        const user = await User.findById(userId);

        if (!user) {
            throw new ApiError({
                statusCode: 404,
                message: "User not found!",
            });
        }

        const typedUser = user as unknown as UserI;

        const accessToken = typedUser.generateAccessToken();
        const refreshToken = typedUser.generateRefreshToken();

        return { accessToken, refreshToken };
    } catch (error) {
        const err = error as Error;
        throw new ApiError({
            statusCode: 500,
            message: err?.message || "Something went wrong",
        });
    }
};

export const signUpUser = asyncHandler(async (req: Request, res: Response) => {

    

});
