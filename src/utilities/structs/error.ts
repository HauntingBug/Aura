class errorClass {

    public createError(errorCode: string, errorMessage: string, messageVars: any[] | undefined, numericErrorCode: number, error: string | undefined, statusCode: number, res: { json?: (arg0: { access_token: string; expires_in: number; expires_at: any; token_type: string; client_id: any; internal_client: boolean; client_service: string; refresh_token?: string | undefined; refresh_expires?: number | undefined; refresh_expires_at?: any; account_id?: any; displayName?: any; app?: string | undefined; in_app_id?: any; device_id?: any; }) => void; set?: any; status?: any; }) {
        res.set({
            'X-Epic-Error-Name': errorCode,
            'X-Epic-Error-Code': numericErrorCode
        });
    
        res.status(statusCode).json({
            errorCode: errorCode,
            errorMessage: errorMessage,
            messageVars: messageVars,
            numericErrorCode: numericErrorCode,
            originatingService: "any",
            intent: "prod",
            error_description: errorMessage,
            error: error
        });
    }

}

const error = new errorClass();
export default error;