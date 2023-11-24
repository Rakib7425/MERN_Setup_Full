class ApiResponse {
	constructor(statusCode, success, message = "Success", data) {
		this.statusCode = statusCode;
		this.success = success;
		this.message = message;
		this.data = data;
	}
}

export { ApiResponse };
