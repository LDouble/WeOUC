var Utils = {
  /**
   * [时间戳]
   * UTILS.now()
   */
  now () {
    return new Date().getTime()
  },

  /**
   * [随机数]
   * UTILS.random(min, max)
   */
  random (min, max) {
    if (max == null) {
      max = min;
      min = 0;
    }
    return min + Math.floor(Math.random() * (max - min + 1));
  }
}

module.exports = Utils;
