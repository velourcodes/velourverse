class ApiError extends Error {
    constructor(message, statusCode = "Something went wrong!", errors = []) {
        super(message);
        this.statusCode = statusCode;
        this.message = message;
        this.data = null;
        this.success = false;
        this.errors = errors;
    }
}
export { ApiError };
