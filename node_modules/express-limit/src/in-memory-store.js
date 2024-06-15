
class InMemoryStore {

    constructor() {
        this._storage = {};
    }

    increment(key, reset, callback) {
        if('function' !== typeof callback) {
            return;
        }

        if(
            !this._storage[key] ||
             this._storage[key].reset <= Date.now()
        ) {

            this._storage[key] = {
                current: 0,
                reset:   reset
            };
        }

        this._storage[key].current++;

        callback(this._storage[key]);
    }
}

module.exports = InMemoryStore;
