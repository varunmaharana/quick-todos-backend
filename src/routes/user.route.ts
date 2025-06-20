import { Router } from "express";
import { validate } from "../middlewares/validate.middleware";
import { loginUser, signUpUser } from "../controllers/user.controller";
import { loginSchema, signUpSchema } from "../validators/user.validator";

const userRouter = Router();

userRouter.route("/signUp").post(validate(signUpSchema), signUpUser);
userRouter.route("/login").post(validate(loginSchema), loginUser);
// userRouter.route("/updateDetails").post(signUp);
// userRouter.route("/signUp").post(signUp);
// userRouter.route("/signUp").post(signUp);

export default userRouter;
