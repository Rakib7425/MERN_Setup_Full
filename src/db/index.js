import mongoose from "mongoose";
// const DB_NAME = process.env.DB_NAME;

const connectDB = async () => {
	try {
		// const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
		const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}`);
		console.log(`MongoDB connected !! DB HOST: ${connectionInstance.connection.host}`);
	} catch (error) {
		console.log("MONGODB connection FAILED ", error);
		process.exit(1);
	}
};

export default connectDB;
