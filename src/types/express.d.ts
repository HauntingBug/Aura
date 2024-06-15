declare module 'express-serve-static-core' {
    interface Request {
        user: User;
        rawBody: string;
    }
}


export interface User {
    created: Date;
    banned: boolean;
    discordId: string;
    accountId: string;
    username: string;
    username_lower: string;
    email: string;
    password: string;
    mfa: boolean;
    matchmakingId: string;
    canCreateCodes: boolean;
    isServer: boolean;
}