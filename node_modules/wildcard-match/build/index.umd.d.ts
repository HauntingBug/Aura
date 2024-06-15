interface WildcardMatchOptions {
    /** Separator to be used to split patterns and samples into segments */
    separator?: string | boolean;
    /** Flags to pass to the RegExp */
    flags?: string;
}
interface isMatch {
    /**
     * Tests if a sample string matches the pattern(s)
     *
     * ```js
     * isMatch('foo') //=> true
     * ```
     */
    (sample: string): boolean;
    /** Compiled regular expression */
    regexp: RegExp;
    /** Original pattern or array of patterns that was used to compile the RegExp */
    pattern: string | string[];
    /** Options that were used to compile the RegExp */
    options: WildcardMatchOptions;
}
declare function isMatch(regexp: RegExp, sample: string): boolean;
/**
 * Compiles one or more glob patterns into a RegExp and returns an isMatch function.
 * The isMatch function takes a sample string as its only argument and returns `true`
 * if the string matches the pattern(s).
 *
 * ```js
 * wildcardMatch('src/*.js')('src/index.js') //=> true
 * ```
 *
 * ```js
 * const isMatch = wildcardMatch('*.example.com', '.')
 * isMatch('foo.example.com') //=> true
 * isMatch('foo.bar.com') //=> false
 * ```
 */
declare function wildcardMatch(pattern: string | string[], options?: string | boolean | WildcardMatchOptions): isMatch;
export = wildcardMatch;
