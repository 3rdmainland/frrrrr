import type { IRestExceptionResponseData } from '@nandos-types/model/api-error';

export default class ApiError extends Error {
    public status = "error";
    public error: IRestExceptionResponseData;

    constructor(message: string, error: IRestExceptionResponseData) {
        super(message);
        this.error = error;
        Error.captureStackTrace(this, this.constructor);
    }
}