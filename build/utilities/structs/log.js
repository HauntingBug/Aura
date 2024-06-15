class logger {
    backend(message) {
        console.log(`\x1b[37m[\x1b[32mBACKEND\x1b[0m\x1b[37m] ${message}`);
    }
    bot(message) {
        console.log(`\x1b[37m[\x1b[35mBOT\x1b[0m\x1b[37m] ${message}`);
    }
    xmpp(message) {
        console.log(`\x1b[37m[\x1b[35mXMPP\x1b[0m\x1b[37m] ${message}`);
    }
    error(message) {
        console.log(`\x1b[37m[\x1b[31mERROR\x1b[0m\x1b[37m] ${message}`);
    }
    request(message) {
        console.log(`\x1b[37m[\x1b[36mREQUEST\x1b[0m\x1b[37m] ${message}`);
    }
    panel(message) {
        console.log(`\x1b[37m[\x1b[33mPANEL\x1b[0m\x1b[37m] ${message}`);
    }
    debug(message) {
        if (process.env.DEBUG_LOG === "true") {
            console.log(`\x1b[37m[\x1b[34mDEBUG\x1b[0m\x1b[37m] ${message}`);
        }
    }
    warn(message) {
        console.log(`\x1b[37m[\x1b[33mWARN\x1b[0m\x1b[37m] ${message}`);
    }
    api = (message) => {
        console.log(`\x1b[37m[\x1b[36mAPI\x1b[0m\x1b[37m] ${message}`);
    };
}
export default new logger();
//# sourceMappingURL=log.js.map