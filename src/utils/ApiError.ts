export class ApiError extends Error {
    public statusCode: number;
    public data: null;
    public success: false;
    public errors: string[] | object[];

    constructor({
        statusCode,
        message = "Something went wrong!",
        errors = [],
        stack = "",
    }: {
        statusCode: number;
        message?: string;
        errors?: string[] | object[];
        stack?: string;
    }) {
        super(message);

        this.statusCode = statusCode;
        this.message = message;
        this.success = false;
        this.errors = errors;
        this.data = null;

        if (stack) {
            this.stack = stack;
        } else {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}
