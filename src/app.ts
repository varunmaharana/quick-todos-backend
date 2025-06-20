import express from "express";
import cors from "cors";
import { errorHandler } from "./middlewares/error.middleware";
import cookieParser from "cookie-parser";

const app = express();

const corsOptions = {
    origin: process.env.CORS_ORIGIN,
    credentials: true,
};

app.use(cors(corsOptions));

app.use(express.json({ limit: "16kb" }));

app.use(express.urlencoded({ extended: true, limit: "16kb" }));

app.use(express.static("public"));

app.use(cookieParser());

// Routes Imports
// Routes Imports - END

// Routes Declaration
// Routes Declaration - END

app.use(errorHandler);

export { app };
