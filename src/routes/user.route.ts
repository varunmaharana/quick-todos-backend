import { verifyJWT } from './../middlewares/auth.middleware';
import { Router } from "express";
import { validate } from "../middlewares/validate.middleware";
import { loginUser, refreshAccessToken, signUpUser } from "../controllers/user.controller";
import { loginSchema, signUpSchema } from "../validators/user.validator";

const userRouter = Router();

// Insecure
userRouter.route("/signUp").post(validate(signUpSchema), signUpUser);
userRouter.route("/login").post(validate(loginSchema), loginUser);
// Insecure

// Secure
userRouter.route("/refreshToken").post(refreshAccessToken);
// userRouter.route("/logout").post(validate(loginSchema), loginUser);
// Secure


export default userRouter;
