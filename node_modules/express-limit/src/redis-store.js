class RedisStore {
  constructor(client) {
    this._client = client;
  }

  increment(key, reset, callback) {
    if ("function" !== typeof callback) {
      return;
    }

    this._client
      .get(key + "_reset")
      .then((value) => {
        const multi = this._client.multi();

        if (!value || +value <= Date.now()) {
          const expire = Math.floor((reset - Date.now()) / 1000) + 60;

          multi.set(key + "_reset", reset, "EX", expire);
          multi.set(key + "_current", 0, "EX", expire);

          value = reset;
        }

        multi.incr(key + "_current");

        return multi.exec().then((replies) => {
          callback({
            reset: +value,
            current: replies[replies.length - 1],
          });
        });
      })
      .catch((err) => {
        return callback({}, err);
      });
  }
}

module.exports = RedisStore;
