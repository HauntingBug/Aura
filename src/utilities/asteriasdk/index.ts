import os from "os";

type iKey = "name" | "id" | "description";

interface AsteriaOptions {
    collectAnonStats: boolean;
    readonly uid?: string;
    usedURL?: URL;
    throwErrors?: boolean;
}

function generateUniqueIdentifier(): string {
    const ip = os.networkInterfaces();
    const operatingSystem = os.platform();
    const encoded = Buffer.from(`${ip}-${operatingSystem}`).toString("base64");

    return encoded;
};

class Asteria {
    public collectAnonStats: boolean;
    private readonly uid: string;
    private usedURL: URL;
    public throwErrors: boolean;

    constructor(options: AsteriaOptions) {
        this.collectAnonStats = options.collectAnonStats;
        if (!this.collectAnonStats) {
            throw new TypeError("The 'collectAnonStats' option must be a boolean value of either true or false.");
        }
        this.uid = this.collectAnonStats ? generateUniqueIdentifier() : "disabled";
        this.usedURL = new URL(options.usedURL ? options.usedURL : "https://fortnite.rest/");
        this.throwErrors = options.throwErrors ? options.throwErrors : false;
    }


    private async getEntity(key: iKey, value: string, ignoreErrors: boolean): Promise<any> {
        const req = await fetch(`${this.usedURL}/cosmetics?${key}=${value}`, {
            method: "GET",
            headers: {
                "key": key,
                [key]: value,
            }
        });

        if (!req.ok) {
            if (req.status === 404) {
                if (ignoreErrors) return;
                if (this.throwErrors) throw new Error(`Entity $could not be found by Key ${key} and Value ${value}. Please check your Key and Value.`);
            } else {
                if (ignoreErrors) return;
                throw new Error(`Error ${req.status} occurred while fetching cosmetic with key ${key} and value ${value}.`);
            }
        }

        return await req.json();
    }

    public async getCosmetic(key: iKey, value: string, ignoreErrors?: boolean): Promise<any> {
        try {
            if (ignoreErrors !== undefined)
                return this.getEntity(key, value, ignoreErrors);
        } catch (error: any) {
        }
    };
}

export default Asteria;