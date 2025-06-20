interface ApiResponseParams<T> {
    statusCode?: number;
    data?: T;
    message?: string;
}

class ApiResponse<T> {
    public statusCode: number;
    public data: T;
    public message: string;
    public success: boolean;

    constructor({
        statusCode = 200,
        data = null as unknown as T,
        message = "Success",
    }: ApiResponseParams<T> = {}) {
        this.statusCode = statusCode;
        this.data = data;
        this.message = message;
        this.success = statusCode < 400;
    }
}

export { ApiResponse };
