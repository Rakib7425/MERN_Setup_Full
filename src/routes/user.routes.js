import { Router } from "express";
import {
	registerUser,
	login,
	getUsers,
	getUserById,
	updateProfile,
	updateAvatarImage,
} from "../controllers/user.controller.js";

import { saveToLocal } from "../middlewares/multer.middleware.js";

const router = Router();

router.route("/register").post(
	saveToLocal.fields([
		{
			name: "avatar",
			maxCount: 1,
		},
		{
			name: "coverImage",
			maxCount: 1,
		},
	]),

	registerUser
);

router.route("/login").post(login);
router.route("/getuser").get(getUserById);
router.route("/getusers").get(getUsers);
router.route("/updateprofile").patch(updateProfile); // Working in progress
router.route("/updateavatarimage").patch(saveToLocal.single("avatar"), updateAvatarImage); // Working in progress

export default router;
