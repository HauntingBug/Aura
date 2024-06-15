export const delay = time => next => (url, opts) => {
    return new Promise(res => setTimeout(() => res(next(url, opts)), time));
};
//# sourceMappingURL=delay.js.map