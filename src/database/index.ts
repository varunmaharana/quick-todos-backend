import mongoose from "mongoose";

const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(
            `${process.env.MONGODB_URI}`
        );

        console.log(
            `\nMongoDB Connection Established!\nDB HOST: ${connectionInstance.connection.host}`
        );
    } catch (error) {
        console.error("\nMongoDB Connection Failed!\n", error);
        process.exit(1);
    }
};

export default connectDB;
