import fs from "fs";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import { saveToLocal } from "../middlewares/multer.middleware.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const registerUser = asyncHandler(async (req, res) => {
	const { username, email, fullName, password } = req.body;

	if (!username || !email || !fullName || !password) {
		res.status(400).json({
			success: false,
			message: " All  fields are mandatory. (username, email, full name and password)",
		});
		return;
	}

	const dbResponse = new User({ username, email, fullName, password });
	const user = await dbResponse.save();
	if (!!user) {
		const token = await dbResponse.generateRefreshToken();
		res.status(201).json({
			success: true,
			message: "User created successfully",
			token,
			data: user,
		});
	} else {
		res.json({ dbResponse });
	}
	return;
});

const getUsers = asyncHandler(async (req, res) => {
	const users = await User.find({});
	// console.log(user);
	if (users.length < 1) {
		res.status(404).json({
			success: true,
			message: "No user found!",
		});
		return;
	}
	res.status(200).json({
		success: true,
		message: "Data fetched successfully!",
		users,
	});
});

const getUserById = asyncHandler(async (req, res) => {
	//
	const id = req.query.id;
	const user = await User.findById({ _id: id });
	if (!user) {
		res.status(404).json({
			success: false,
			message: "No user found!",
		});
		return;
	}

	res.status(200).json({
		success: true,
		message: "Data fetched successfully!",
		user,
	});
});

const updateProfile = asyncHandler(async (req, res) => {
	//
	const id = req.query.id;
	const response = await User.findByIdAndUpdate(
		{ _id: id },
		{ email: req.body.email, fullName: req.body.fullName },
		{ new: true }
	);
	if (!response) {
		res.status(404).json({
			success: false,
			message: "User not found",
		});
	} else {
		res.status(200).json({
			success: true,
			message: "Profile updated successfully",
			user: response,
		});
	}
});

const updateAvatarImage = asyncHandler(async (req, res) => {
	//
	const localFilePath = req.file.path;
	console.log(localFilePath);

	const cloudinaryResponse = await uploadOnCloudinary(localFilePath);

	if (!cloudinaryResponse) {
		throw new Error("Error uploading file to Cloudinary");
	}
	const id = req.query.id;

	const response = await User.findByIdAndUpdate(
		{ _id: id },
		{ avatar: cloudinaryResponse.secure_url },
		{ new: true }
	);

	if (!response) {
		return res.status(404).json({
			success: false,
			message: "User not found",
		});
	}
	fs.unlinkSync(localFilePath);
	// Send a success response
	res.status(200).json({
		success: true,
		message: "Profile avatar image updated successfully",
		avatar_url: response.avatar,
	});
});

export { registerUser, getUsers, getUserById, updateProfile, updateAvatarImage };
