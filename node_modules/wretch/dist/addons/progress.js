/**
 * Adds the ability to monitor progress when downloading a response.
 *
 * _Compatible with all platforms implementing the [TransformStream WebAPI](https://developer.mozilla.org/en-US/docs/Web/API/TransformStream#browser_compatibility)._
 *
 * ```js
 * import ProgressAddon from "wretch/addons/progress"
 *
 * wretch("some_url")
 *   // Register the addon
 *   .addon(ProgressAddon())
 *   .get()
 *   // Log the progress as a percentage of completion
 *   .progress((loaded, total) => console.log(`${(loaded / total * 100).toFixed(0)}%`))
 * ```
 */
const progress = () => {
    function transformMiddleware(state) {
        return next => (url, opts) => {
            let loaded = 0;
            let total = 0;
            return next(url, opts).then(response => {
                try {
                    const contentLength = response.headers.get("content-length");
                    total = contentLength ? +contentLength : null;
                    const transform = new TransformStream({
                        transform(chunk, controller) {
                            loaded += chunk.length;
                            if (total < loaded) {
                                total = loaded;
                            }
                            if (state.progress) {
                                state.progress(loaded, total);
                            }
                            controller.enqueue(chunk);
                        }
                    });
                    return new Response(response.body.pipeThrough(transform), response);
                }
                catch (e) {
                    return response;
                }
            });
        };
    }
    return {
        beforeRequest(wretch, _, state) {
            return wretch.middlewares([transformMiddleware(state)]);
        },
        resolver: {
            progress(onProgress) {
                this._sharedState.progress = onProgress;
                return this;
            }
        },
    };
};
export default progress;
//# sourceMappingURL=progress.js.map