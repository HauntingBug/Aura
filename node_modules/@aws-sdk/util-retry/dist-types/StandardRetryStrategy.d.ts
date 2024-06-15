import { Provider, RetryErrorInfo, RetryStrategyV2, StandardRetryToken } from "@aws-sdk/types";
/**
 * @public
 */
export declare class StandardRetryStrategy implements RetryStrategyV2 {
    private readonly maxAttempts;
    readonly mode: string;
    private retryToken;
    private readonly maxAttemptsProvider;
    constructor(maxAttempts: number);
    constructor(maxAttemptsProvider: Provider<number>);
    acquireInitialRetryToken(retryTokenScope: string): Promise<StandardRetryToken>;
    refreshRetryTokenForRetry(tokenToRenew: StandardRetryToken, errorInfo: RetryErrorInfo): Promise<StandardRetryToken>;
    recordSuccess(token: StandardRetryToken): void;
    private getMaxAttempts;
    private shouldRetry;
    private isRetryableError;
}
