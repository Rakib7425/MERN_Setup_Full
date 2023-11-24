import fs from "fs";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

/* Handles the registration of a user. It
takes in two parameters, `req` and `res`, which represent the request and response objects
respectively. */

const registerUser = asyncHandler(async (req, res) => {
	// get user details from frontend
	// validation - not empty
	// check if user already exists: username, email
	// check for images, check for avatar
	// upload them to cloudinary, avatar
	// create user object - create entry in db
	// remove password and refresh token field from response
	// check for user creation
	// return res
	console.log(req.files["avatar"][0].path);

	const { fullName, email, username, password } = req.body;
	// console.log("email: ", email);

	if ([fullName, email, username, password].some((field) => field?.trim() === "")) {
		throw new ApiError(400, "All fields are required");
	}

	const existedUser = await User.findOne({
		$or: [{ username }, { email }],
	});

	if (existedUser) {
		throw new ApiError(409, "User with email or username already exists");
	}

	const avatarLocalPath = req.files["avatar"][0]?.path;
	let coverImageLocalPath = "";

	if (req.files && Array.isArray(req.files) && req.files.length > 0) {
		coverImageLocalPath = req.files["coverImage"][0].path;
	}

	if (!avatarLocalPath) {
		throw new ApiError(400, "Avatar file is required");
	}

	let avatar = "";
	let coverImage = "";

	if (!existedUser) {
		avatar = await uploadOnCloudinary(avatarLocalPath);
		coverImage = await uploadOnCloudinary(coverImageLocalPath);
	}

	// if (!existedUser) {
	// 	// Delete the file after upload to cloud.
	// 	fs.unlinkSync(avatarLocalPath);
	// 	fs.unlinkSync(coverImageLocalPath);
	// }

	if (!avatar) {
		throw new ApiError(400, "Avatar file is required");
	}

	const user = await User.create({
		username: username.toLowerCase(),
		email,
		fullName,
		avatar: avatar.secure_url,
		coverImage: coverImage?.secure_url || "",
		password,
	});

	const createdUser = await User.findById(user._id).select("-password -refreshToken");

	if (!createdUser) {
		throw new ApiError(500, "Something went wrong while registering the user");
	}

	return res
		.status(201)
		.json(new ApiResponse(200, true, createdUser, "User registered Successfully"));
});

/* Handling the login functionality of a user. It takes in the
`req` (request) and `res` (response) objects as parameters. */
const login = asyncHandler(async (req, res) => {
	const identifier = req.body.identifier; // login with username or email
	const password = req.body.password;
	// console.log(identifier);

	const user = await User.findOne({
		$or: [{ username: identifier }, { email: identifier }],
	});

	if (user) {
		const isPasswordCorrect = await user.isPasswordCorrect(password);
		if (!isPasswordCorrect) {
			return res.status(401).json({
				success: false,
				message: "Incorrect password",
			});
		}

		res.status(200).json({
			success: true,
			data: user,
		});
		return;
	}

	if (!user) {
		return res.status(404).json({
			success: true,
			message: " Invalid username or email. No user found!",
		});
	}
});

/* Retrieves all users from the
database and sends a response with the user data. */
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
	return;
});

/* Retrieves a user from the
database based on the provided `id` parameter. */
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
	return;
});

/* Updates the profile of a user
in the database based on the provided `id` parameter. */
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
	return;
});

/* Updates the avatar image
of a user in the database. */
const updateAvatarImage = asyncHandler(async (req, res) => {
	//
	const localFilePath = req.file.path;
	// console.log(localFilePath);

	const id = req.query.id;

	const isUserExist = await User.findById({ _id: id });
	if (!isUserExist) {
		res.status(404).json({
			success: false,
			message: "User not found",
		});
		return;
	}

	const cloudinaryResponse = await uploadOnCloudinary(localFilePath);

	if (!cloudinaryResponse) {
		throw new Error("Error uploading file to Cloudinary");
	}

	const response = await User.findByIdAndUpdate(
		{ _id: id },
		{ avatar: cloudinaryResponse.secure_url },
		{ new: true }
	);

	// Send a success response
	return res.status(200).json({
		success: true,
		message: "Profile avatar image updated successfully",
		avatar_url: response.avatar,
	});
});

export { registerUser, login, getUsers, getUserById, updateProfile, updateAvatarImage };
