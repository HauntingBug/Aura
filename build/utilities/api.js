import Api from "../model/api.js";
async function verifyApikey(req, res, next) {
    const apikey = req.headers["x-api-key"];
    if (!apikey) {
        return res.status(401).json({ error: "No api key provided" });
    }
    const cachedApi = await global.kv.get(apikey);
    if (cachedApi) {
        return next();
    }
    try {
        const api = await Api.findOne({ apikey });
        if (!api) {
            return res.status(401).json({ error: "Invalid api key" });
        }
        global.kv.set(apikey, JSON.stringify(api));
        next();
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Internal server error" });
    }
}
export { verifyApikey };
//# sourceMappingURL=api.js.map