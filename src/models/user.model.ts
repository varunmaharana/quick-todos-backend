import mongoose, { Document, Model, Schema, Types } from "mongoose";
import bcrypt from "bcrypt";
import jwt, { SignOptions } from "jsonwebtoken";
import { ApiError } from "../utils/ApiError";

export interface UserMethods {
    generateAccessToken(): string;
    generateRefreshToken(): string;
    isPasswordCorrect(password: string): Promise<boolean>;
}

export interface UserI extends Document, UserMethods {
    _id: Types.ObjectId;
    name?: string;
    username: string;
    email: string;
    password: string;
    refreshToken: string;
}

const userSchema = new Schema<UserI, Model<UserI>, UserMethods>(
    {
        name: {
            type: String,
            required: false,
            default: null,
        },
        username: {
            type: String,
            required: [true, "Username is required"],
            trim: true,
            lowercase: true,
        },
        email: {
            type: String,
            required: [true, "Email is required!"],
            unique: true,
        },
        password: {
            type: String,
            required: [true, "Password is required!"],
        },
        refreshToken: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
);

// Encrypt the password before saving it to the database
userSchema.pre("save", async function (next) {
    // Only encrypt if password is modified
    if (this.isModified("password")) {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } else {
        return next();
    }
});

// Custom method that check is password is correct
userSchema.methods.isPasswordCorrect = async function (
    password: string
): Promise<boolean> {
    return await bcrypt.compare(password, this.password);
};

// Custom methods to generate Access Token
userSchema.methods.generateAccessToken = function (): string {
    const secret = process.env.ACCESS_TOKEN_SECRET as string;
    const expiry = process.env.ACCESS_TOKEN_EXPIRY as string;

    if (!secret || !expiry) {
        throw new ApiError({
            statusCode: 500,
            message:
                "Access token secret or expiry time not set in environment variables",
            errors: ["Something went wrong!"],
        });
    }

    return jwt.sign(
        {
            _id: this._id,
            name: this.name,
            username: this.username,
            email: this.email,
        },
        secret,
        {
            expiresIn: expiry as SignOptions["expiresIn"],
        }
    );
};

// Custom methods to generate Refresh Token
userSchema.methods.generateRefreshToken = function (): string {
    const secret = process.env.REFRESH_TOKEN_SECRET as string;
    const expiry = process.env.REFRESH_TOKEN_EXPIRY as string;

    if (!secret || !expiry) {
        throw new ApiError({
            statusCode: 500,
            message:
                "Refresh token secret or expiry time not set in environment variables",
            errors: ["Something went wrong!"],
        });
    }

    return jwt.sign(
        {
            _id: this._id,
        },
        secret,
        {
            expiresIn: expiry as SignOptions["expiresIn"],
        }
    );
};

export const User = mongoose.model<UserI>("User", userSchema);
