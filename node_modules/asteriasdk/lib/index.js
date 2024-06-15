"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const os = require("os");
function generateUniqueIdentifier() {
    const ip = os.networkInterfaces();
    const operatingSystem = os.platform();
    const encoded = Buffer.from(`${ip}-${operatingSystem}`).toString("base64");
    return encoded;
}
;
class Asteria {
    constructor(options) {
        this.collectAnonStats = options.collectAnonStats;
        if (!this.collectAnonStats) {
            throw new TypeError("The 'collectAnonStats' option must be a boolean value of either true or false.");
        }
        this.uid = this.collectAnonStats ? generateUniqueIdentifier() : "disabled";
        this.usedURL = new URL(options.usedURL ? options.usedURL : "https://api.asteria.nexusfn.net/api/");
        this.throwErrors = options.throwErrors ? options.throwErrors : false;
    }
    getEntity(key, value, entity, ignoreErrors) {
        return __awaiter(this, void 0, void 0, function* () {
            const req = yield fetch(`${this.usedURL}${entity}/`, {
                method: "GET",
                headers: {
                    "key": key,
                    [key]: value,
                    "uid": this.uid
                }
            });
            if (!req.ok) {
                if (req.status === 404) {
                    if (ignoreErrors)
                        return;
                    if (this.throwErrors)
                        throw new Error(`Entity ${entity} could not be found by Key ${key} and Value ${value}. Please check your Key and Value.`);
                }
                else {
                    if (ignoreErrors)
                        return;
                    throw new Error(`Error ${req.status} occurred while fetching ${entity} with key ${key} and value ${value}.`);
                }
            }
            const reqJson = yield req.json();
            const document = reqJson.document;
            return yield document;
        });
    }
    getCosmetic(key, value, ignoreErrors) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (ignoreErrors !== undefined)
                    return this.getEntity(key, value, "battleroyale", ignoreErrors);
            }
            catch (error) {
            }
        });
    }
    ;
    getBanner(key, value, ignoreErrors) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (ignoreErrors !== undefined)
                    return this.getEntity(key, value, "banners", ignoreErrors);
            }
            catch (error) {
            }
        });
    }
    ;
    getPlaylist(key, value, ignoreErrors) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (ignoreErrors !== undefined)
                    return this.getEntity(key, value, "playlists", ignoreErrors);
            }
            catch (error) {
            }
        });
    }
    ;
    getPoi(key, value, ignoreErrors) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (ignoreErrors !== undefined)
                    return this.getEntity(key, value, "pois", ignoreErrors);
            }
            catch (error) {
                throw new Error(error);
            }
        });
    }
    ;
}
exports.default = Asteria;
