export declare class AppError extends Error {
    message: string;
    statusCode: number;
    details?: any | undefined;
    constructor(message: string, statusCode?: number, details?: any | undefined);
}
export declare class HttpError extends AppError {
    constructor(message: string, statusCode?: number, details?: any);
}
export declare class ServiceError extends AppError {
    constructor(message: string, statusCode?: number, details?: any);
}
export declare class RepositoryError extends AppError {
    constructor(message: string, statusCode?: number, details?: any);
}
//# sourceMappingURL=error-handler.d.ts.map