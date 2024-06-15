class RedisLegacyStore {
  constructor(client) {
    this._client = client;
  }

  increment(key, reset, callback) {
    if ("function" !== typeof callback) {
      return;
    }

    this._client.get(key + "_reset", (err, value) => {
      if (err) {
        return callback({}, err);
      }

      const multi = this._client.multi();

      if (!value || +value <= Date.now()) {
        const expire = Math.floor((reset - Date.now()) / 1000) + 60;

        multi.set(key + "_reset", reset, "EX", expire);
        multi.set(key + "_current", 0, "EX", expire);

        value = reset;
      }

      multi.incr(key + "_current");

      multi.exec((err, replies) => {
        if (err) {
          return callback({}, err);
        }

        callback({
          reset: +value,
          current: replies[replies.length - 1],
        });
      });
    });
  }
}

module.exports = RedisLegacyStore;
