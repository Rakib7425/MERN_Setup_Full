import { Router } from "express";
import {
	registerUser,
	getUsers,
	getUserById,
	updateProfile,
	updateAvatarImage,
} from "../controllers/user.controller.js";

import { saveToLocal } from "../middlewares/multer.middleware.js";

const router = Router();

router.route("/register").post(registerUser);
router.route("/getuser").get(getUserById);
router.route("/getusers").get(getUsers);
router.route("/updateprofile").patch(updateProfile); // Working in progress
router.route("/updateavatarimage").patch(saveToLocal.single("avatar"), updateAvatarImage); // Working in progress

export default router;
