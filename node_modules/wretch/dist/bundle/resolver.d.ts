import type { Wretch, WretchResponse, WretchError as WretchErrorType } from "./types.js";
/**
 * This class inheriting from Error is thrown when the fetch response is not "ok".
 * It extends Error and adds status, text and body fields.
 */
export declare class WretchError extends Error implements WretchErrorType {
    status: number;
    response: WretchResponse;
    url: string;
    text?: string;
    json?: any;
}
export declare const resolver: <T, Chain, R>(wretch: T & Wretch<T, Chain, R>) => any;
