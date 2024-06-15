/**
 * @private @internal
 */
export const middlewareHelper = (middlewares) => (fetchFunction) => {
    return middlewares.reduceRight((acc, curr) => curr(acc), fetchFunction) || fetchFunction;
};
//# sourceMappingURL=middleware.js.map