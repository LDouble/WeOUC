const storage = require("./src/storage");
const database = require("./src/db").Db;
const functions = require("./src/functions");

function Tcb() {
  this.config = {
    get secretId() {
      return this._secretId
        ? this._secretId
        : process.env.TENCENTCLOUD_SECRETID;
    },
    set secretId(id) {
      this._secretId = id;
    },
    get secretKey() {
      return this._secretKey
        ? this._secretKey
        : process.env.TENCENTCLOUD_SECRETKEY;
    },
    set secretKey(key) {
      this._secretKey = key;
    },
    get sessionToken() {
      if (this._sessionToken === undefined) {
        //默认临时密钥
        return process.env.TENCENTCLOUD_SESSIONTOKEN;
      } else if (this._sessionToken === false) {
        //固定秘钥
        return undefined;
      } else {
        //传入的临时密钥
        return this._sessionToken;
      }
    },
    set sessionToken(token) {
      this._sessionToken = token;
    },
    envName: undefined,
    proxy: undefined
  };
}

Tcb.prototype.init = function ({
  secretId,
  secretKey,
  sessionToken,
  env,
  proxy
} = {}) {
  if ((secretId && !secretKey) || (!secretId && secretKey)) {
    throw Error("secretId and secretKey must be a pair");
  }

  if (secretId) {
    this.config.secretId = secretId;
  }

  if (secretKey) {
    this.config.secretKey = secretKey;
  }

  if (secretId && secretKey) {
    this.config.sessionToken = sessionToken ? sessionToken : false;
  }

  env && (this.config.envName = env);
  proxy && (this.config.proxy = proxy);
};

Tcb.prototype.database = function () {
  return new database(this);
};

function each(obj, fn) {
  for (var i in obj) {
    if (obj.hasOwnProperty(i)) {
      fn(obj[i], i);
    }
  }
}

function extend(target, source) {
  each(source, function (val, key) {
    target[key] = source[key];
  });
  return target;
}

extend(Tcb.prototype, functions);
extend(Tcb.prototype, storage);

module.exports = new Tcb();
