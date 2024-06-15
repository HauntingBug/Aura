import { CONTENT_TYPE_HEADER } from "./constants.js";
export function extractContentType(headers = {}) {
    var _a;
    return (_a = Object.entries(headers).find(([k]) => k.toLowerCase() === CONTENT_TYPE_HEADER.toLowerCase())) === null || _a === void 0 ? void 0 : _a[1];
}
export function isLikelyJsonMime(value) {
    return /^application\/.*json.*/.test(value);
}
export const mix = function (one, two, mergeArrays = false) {
    return Object.entries(two).reduce((acc, [key, newValue]) => {
        const value = one[key];
        if (Array.isArray(value) && Array.isArray(newValue)) {
            acc[key] = mergeArrays ? [...value, ...newValue] : newValue;
        }
        else if (typeof value === "object" && typeof newValue === "object") {
            acc[key] = mix(value, newValue, mergeArrays);
        }
        else {
            acc[key] = newValue;
        }
        return acc;
    }, { ...one });
};
//# sourceMappingURL=utils.js.map