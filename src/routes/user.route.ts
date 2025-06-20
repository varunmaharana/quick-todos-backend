import { Router } from "express";
import { signUpUser } from "../controllers/user.controller";

const userRouter = Router();

userRouter.route("/signUp").post(signUpUser);
// userRouter.route("/login").post(signUp);
// userRouter.route("/updateDetails").post(signUp);
// userRouter.route("/signUp").post(signUp);
// userRouter.route("/signUp").post(signUp);

export default userRouter;
