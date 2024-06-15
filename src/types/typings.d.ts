// typings.d.ts

import { Client } from "discord.js";

export interface KvType {
    get: (key: string) => Promise<any>;
    set: (key: string, value: any) => Promise<boolean>;
    setttl: (key: string, value: any, ttl: number) => Promise<boolean>;
}

export interface iEnv {
    MONGO_URI: string;
    BOT_TOKEN: string;
    CLIENT_ID: string;
    GUILD_ID: string;
    NAME: string;
    PORT: number;
    GAME_SERVERS: string[];
    ALLOW_REBOOT: boolean;
    MATCHMAKER_IP: string;
    MAIN_SEASON: number;
    USE_S3: boolean;
    S3_BUCKET_NAME: string;
    S3_ENDPOINT: string;
    S3_ACCESS_KEY_ID: string;
    S3_SECRET_ACCESS_KEY: string;
    USE_REDIS: boolean;
    REDIS_URL: string;
    ENABLE_CROSS_BANS: boolean;
}

export interface iModules {
    Shop: boolean;
    Matchmaking: boolean;
    [key: string]: boolean;
}

export interface SafetyType {
    convertToBool: (value: string | undefined | boolean, key: string) => boolean;
    isDevFunction: () => boolean;
    registerLoopKey: () => Promise<boolean>;
    getLoopKey: () => Promise<string>;
    airbag: () => Promise<boolean>;
    isDocker: () => boolean;
    isDev: boolean;
    env: iEnv;
    modules: iModules;
    [key: string]: any;
}

declare global {
    namespace NodeJS {
        interface Global {
            kv: KvType;
            safety: SafetyType;
            discordClient: Client;
            JWT_SECRET: string;
            safetyEnv: iEnv;
            tokens: {
                accessTokens: {
                    accountId: string;
                    token: string;
                }[];
                refreshTokens: {
                    accountId: string;
                    token: string;
                }[];
                clientTokens: {
                    ip: string;
                    token: string;
                }[]
            }
            accessTokens: {
                accountId: string;
                token: string;
            }[];
            refreshTokens: {
                accountId: string;
                token: string;
            }[];
            clientTokens: {
                ip: string;
                token: string;
            }[]
            smartXMPP: boolean;
            exchangeCodes: any;
        }

        interface ProcessEnv {
            MONGO_URI: string;
            BOT_TOKEN: string;
            NAME: string;
            GAME_SERVERS: string;
            ALLOW_REBOOT: boolean;
            MAIN_SEASON: string;
            MATCHMAKER_IP: string;
            PORT: string;
            USE_S3: boolean;
            S3_BUCKET_NAME: string;
            S3_ENDPOINT: string;
            S3_ACCESS_KEY_ID: string;
            S3_SECRET_ACCESS_KEY: string;
            USE_REDIS: boolean;
            REDIS_URL: string;
            ENABLE_CROSS_BANS: boolean;
            DEBUG_LOG: boolean;
        }
    }
}

export interface ShopResponse {
    daily: Daily[];
    featured: Daily[];
}

export interface Daily {
    id: string;
    name: string;
    price: number;
    rarity: string;
    type: string;
    shopName: string;
    images: Images;
}

export interface Images {
    smallIcon: string;
    icon: string;
    featured: null | string;
    other: null;
}
