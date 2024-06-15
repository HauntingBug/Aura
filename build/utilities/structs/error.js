class errorClass {
    createError(errorCode, errorMessage, messageVars, numericErrorCode, error, statusCode, res) {
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
//# sourceMappingURL=error.js.map