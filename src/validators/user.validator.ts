import { z } from "zod";

export const baseUserSchema = z.object({
    name: z.string().min(1, "Name cannot be empty").optional(),
    username: z
        .string()
        .min(3, "Username must be at least 3 characters")
        .max(20)
        .regex(
            /^[a-zA-Z0-9_]+$/,
            "Username can only contain letters, numbers, and underscores"
        ),
    email: z.string().email("Invalid email address"),
    password: z
        .string()
        .min(6, "Password must be at least 6 characters")
        .max(100),
});

// Signup Schema = all fields required except name
export const signUpSchema = baseUserSchema.extend({
    name: z.string().optional(),
});

// Signin Schema = only email and password required
export const loginSchema = z.object({
    username: baseUserSchema.shape.username,
    password: baseUserSchema.shape.password,
});

// Update Profile = optional editable fields
export const updateProfileSchema = z.object({
    name: baseUserSchema.shape.name.optional(),
    username: baseUserSchema.shape.username.optional(),
    email: baseUserSchema.shape.email.optional(),
});

// Change Password = requires current + new
export const changePasswordSchema = z.object({
    currentPassword: baseUserSchema.shape.password,
    newPassword: baseUserSchema.shape.password,
});
