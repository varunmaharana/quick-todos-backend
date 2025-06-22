import { Types } from "mongoose";
import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { User, UserI } from "../models/user.model";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import jwt from "jsonwebtoken";

// Dedicated function to generate both access and refresh tokens
const generateAccessAndRefreshTokens = async (
    userId: Types.ObjectId | string
) => {
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

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

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

export const loginUser = asyncHandler(async (req: Request, res: Response) => {
    const { username, password } = req.body;

    // Fetch user from db
    const user = await User.findOne({ username });

    // If user is not found, throw error
    if (!user) {
        throw new ApiError({
            statusCode: 404,
            message: "User does not exist",
        });
    }

    // Check password
    const isPasswordCorrect = await user.isPasswordCorrect(password);
    if (!isPasswordCorrect) {
        throw new ApiError({
            statusCode: 401,
            message: "Invalid credentials",
        });
    }

    // Generate access and refresh tokens
    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
        user._id
    );

    const loggedInUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    const cookieOptions = {
        httpOnly: true,
        secure: true,
    };

    return res
        .status(201)
        .cookie("accessToken", accessToken, cookieOptions)
        .cookie("refreshToken", refreshToken, cookieOptions)
        .json(
            new ApiResponse({
                statusCode: 201,
                message: "Login successful!",
                data: {
                    user: loggedInUser,
                    accessToken,
                    refreshToken,
                },
            })
        );
});

export const refreshAccessToken = asyncHandler(
    async (req: Request, res: Response) => {
        const incomingRefreshToken =
            req.cookies?.refreshToken || req.body?.refreshToken;

        if (!incomingRefreshToken) {
            throw new ApiError({
                statusCode: 401,
                message: "Unauthorized request",
            });
        }

        try {
            const decodedToken = jwt.verify(
                incomingRefreshToken,
                process.env.REFRESH_TOKEN_SECRET as string
            );

            if (typeof decodedToken === "string" || !("_id" in decodedToken)) {
                throw new ApiError({
                    statusCode: 401,
                    message: "Invalid refresh token",
                });
            }

            const user = await User.findById(decodedToken?._id);

            if (!user) {
                throw new ApiError({
                    statusCode: 401,
                    message: "Invalid refresh token",
                });
            }

            if (incomingRefreshToken !== user?.refreshToken) {
                throw new ApiError({
                    statusCode: 401,
                    message: "Refresh token is expired or used",
                });
            }

            const options = {
                httpOnly: true,
                secure: true,
            };
            const { accessToken, refreshToken } =
                await generateAccessAndRefreshTokens(user._id);

            return res
                .status(200)
                .cookie("accessToken", accessToken, options)
                .cookie("refreshToken", refreshToken, options)
                .json(
                    new ApiResponse({
                        statusCode: 201,
                        message: "Login successful!",
                        data: {
                            accessToken,
                            refreshToken,
                        },
                    })
                );
        } catch (error) {}
    }
);

export const logoutUser = asyncHandler(async (req: Request, res: Response) => {
    const { user } = req as Request & {
        user: { _id: string };
    };

    await User.findByIdAndUpdate(
        user._id,
        {
            $unset: {
                refreshToken: 1,
            },
        },
        {
            new: true,
        }
    );

    const options = {
        httpOnly: true,
        secure: true,
    };
    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(
            new ApiResponse({
                statusCode: 200,
                message: "Logout successful!",
                data: {},
            })
        );
});

export const getLoggedInUserDetails = asyncHandler(
    async (req: Request, res: Response) => {
        const { user } = req as Request & {
            user: { _id: string };
        };

        if (!user) {
            throw new ApiError({
                statusCode: 404,
                message: "User not found",
            });
        }

        res.status(200).json(
            new ApiResponse({
                statusCode: 201,
                message: "User details fetched successfully",
                data: user,
            })
        );
    }
);

export const updateUserDetails = asyncHandler(
    async (req: Request, res: Response) => {
        const { name, email, username } = req.body;

        const { user } = req as Request & {
            user: { _id: string };
        };

        if (!user) {
            throw new ApiError({
                statusCode: 404,
                message: "User not found",
            });
        }

        const updatedUser = await User.findByIdAndUpdate(
            user._id,
            {
                $set: {
                    name,
                    email,
                    username,
                },
            },
            {
                new: true,
            }
        ).select("-password -refreshToken -__v");

        res.status(200).json(
            new ApiResponse({
                statusCode: 201,
                message: "User details updated successfully",
                data: updatedUser,
            })
        );
    }
);

export const changeUserPassword = asyncHandler(
    async (req: Request, res: Response) => {
        const { currentPassword, newPassword } = req.body;

        const { user } = req as Request & {
            user: { _id: string };
        };
        if (!user) {
            throw new ApiError({
                statusCode: 404,
                message: "User not found",
            });
        }

        const currentUser = await User.findById(user._id);
        if (!currentUser) {
            throw new ApiError({
                statusCode: 404,
                message: "User not found",
            });
        }

        const isPasswordCorrect =
            await currentUser.isPasswordCorrect(currentPassword);

        if (!isPasswordCorrect) {
            throw new ApiError({
                statusCode: 400,
                message: "Invalid current password",
            });
        }

        currentUser.password = newPassword;

        await currentUser.save({ validateBeforeSave: false });

        res.status(200).json(
            new ApiResponse({
                statusCode: 201,
                message: "User password updated successfully",
                data: {},
            })
        );
    }
);

export const deleteUserDetails = asyncHandler(
    async (req: Request, res: Response) => {
        const { user } = req as Request & {
            user: { _id: string };
        };

        if (!user) {
            throw new ApiError({
                statusCode: 404,
                message: "User not found",
            });
        }

        await User.findByIdAndDelete(user._id);

        res.status(200).json(
            new ApiResponse({
                statusCode: 201,
                message: "User details deleted successfully",
                data: {},
            })
        );
    }
);
