// const asyncHandler = () => {};
// const asyncHandler = (func) => () => {};
// const asyncHandler = (func) => async () => {};

const asyncHandler = (requestHandler) => {
	return async (req, res, next) => {
		try {
			await requestHandler(req, res, next);
		} catch (error) {
			return res.status(500).json({
				success: false,
				message: error.message,
				error,
				if_duplicate_user: error.keyValue,
			});
		}
	};
};

export { asyncHandler };
