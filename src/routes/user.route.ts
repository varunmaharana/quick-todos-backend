import { verifyJWT } from "./../middlewares/auth.middleware";
import { Router } from "express";
import { validate } from "../middlewares/validate.middleware";
import {
    changeUserPassword,
    deleteUserDetails,
    getLoggedInUserDetails,
    loginUser,
    logoutUser,
    refreshAccessToken,
    signUpUser,
    updateUserDetails,
} from "../controllers/user.controller";
import {
    changePasswordSchema,
    loginSchema,
    signUpSchema,
    updateProfileSchema,
} from "../validators/user.validator";

const userRouter = Router();

// Insecure
userRouter.route("/signUp").post(validate(signUpSchema), signUpUser);
userRouter.route("/login").post(validate(loginSchema), loginUser);
// Insecure

// Secure
userRouter.route("/refreshToken").post(refreshAccessToken);
userRouter.route("/logout").post(verifyJWT, logoutUser);
userRouter
    .route("/getLoggedInUserDetails")
    .get(verifyJWT, getLoggedInUserDetails);
userRouter
    .route("/updateUserDetails")
    .patch(verifyJWT, validate(updateProfileSchema), updateUserDetails);
userRouter
    .route("/changeUserPassword")
    .post(verifyJWT, validate(changePasswordSchema), changeUserPassword);
userRouter.route("/deleteUserDetails").delete(verifyJWT, deleteUserDetails);
// Secure

export default userRouter;
