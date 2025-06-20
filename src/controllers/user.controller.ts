import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { User, UserI } from "../models/user.model";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";

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
    const { name, email, username, password } = req.body;

    // Check if user already exists
    const existedUser = await User.findOne({
        $or: [{ username }, { email }],
    });
    if (existedUser) {
        throw new ApiError({
            statusCode: 409,
            message: "User with email or username already exists",
        });
    }

    // If not, then create new user entry
    const user = await User.create({
        name,
        email,
        username: username.toLowerCase(),
        password,
    });

    // Fetch created user using its _id
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    // If created user is not found, throw error
    if (!createdUser) {
        throw new ApiError({
            statusCode: 500,
            message: "Something went wrong while signing up",
        });
    }

    return res.status(201).json(
        new ApiResponse({
            statusCode: 201,
            message: "Sign up successful!",
            data: createdUser,
        })
    );
});

export const loginUser = asyncHandler(
    async (req: Request, res: Response) => {
        
    }
);
