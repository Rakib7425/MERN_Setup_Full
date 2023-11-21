// require('dotenv').config({path: './env'})
import dotenv from "dotenv";
import connectDB from "./src/db/index.js";
import app from "./src/app.js";

dotenv.config({
	path: "./env",
});

const PORT = process.env.PORT || 8080;

(() => {
	connectDB()
		.then(() => {
			app.listen(PORT, () => {
				console.log(`Server is running at port : ${PORT}`);
			});
		})
		.catch((err) => {
			console.log("MONGO db connection failed !!! ", err);
		});
})();
