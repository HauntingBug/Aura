type iKey = "name" | "id" | "description";
interface AsteriaOptions {
    collectAnonStats: boolean;
    readonly uid?: string;
    usedURL?: URL;
    throwErrors?: boolean;
}
declare class Asteria {
    collectAnonStats: boolean;
    private readonly uid;
    private usedURL;
    throwErrors: boolean;
    constructor(options: AsteriaOptions);
    private getEntity;
    getCosmetic(key: iKey, value: string, ignoreErrors?: boolean): Promise<any>;
    getBanner(key: iKey, value: string, ignoreErrors?: boolean): Promise<any>;
    getPlaylist(key: iKey, value: string, ignoreErrors?: boolean): Promise<any>;
    getPoi(key: iKey, value: string, ignoreErrors?: boolean): Promise<any>;
}
export default Asteria;
