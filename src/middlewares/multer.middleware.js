import multer from "multer";

const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, "./public/temp");
	},
	filename: function (req, file, cb) {
		// const postfix = Math.random() * 100 + 1;
		// _${postfix}
		cb(null, `${file.originalname}`);
	},
});

export const saveToLocal = multer({ storage });
