import dotenv from "dotenv";
import connectDB from "./database";
import { app } from "./app";

dotenv.config({
    path: "./.env",
});

connectDB()
    .then(() => {
        app.on("error", (error) => {
            console.log("ERROR: ", error);
            throw error;
        });

        const port = process.env.PORT || 8000;
        app.listen(port, () => {
            console.log(`Server is running on port ${port}.`);
        });
    })
    .catch((error) => {
        console.error("\nMongoDB Connection Failed!\n", error);
    });
