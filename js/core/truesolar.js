/*
 * truesolar.js — 真太阳时计算（纯逻辑，无 DOM 依赖）
 * 八字排盘应使用「真太阳时」（地方视太阳时），而非北京时间。
 * 经度偏西会使真太阳时比北京时间晚：每偏西 1° 约晚 4 分钟。
 * 真太阳时可能因经度或时差跨过 23:00/00:00 边界，从而改变日柱与时辰。
 *
 * 公式（常用近似）：
 *   地方平太阳时 = 北京时间 − (120° − 经度) × 4 分钟
 *   真太阳时     = 地方平太阳时 + 时差(EoT)
 * 时差采用经典近似公式，精度约 ±1 分钟，足以判断时辰边界。
 */
(function (root, factory) {
  if (typeof module !== 'undefined' && module.exports) module.exports = factory();
  else root.TrueSolar = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  // 时差（Equation of Time），单位：分钟。传入 UTC 日期。
  function equationOfTime(date) {
    const start = Date.UTC(date.getUTCFullYear(), 0, 0);
    const d = Math.round((Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()) - start) / 86400000);
    const B = 360 * (d - 81) / 365.25; // 度
    const r = Math.PI / 180;
    return 9.87 * Math.sin(2 * B * r) - 7.53 * Math.cos(B * r) - 1.5 * Math.sin(B * r);
  }

  /**
   * @param {number} year 公历年
   * @param {number} month 公历月(1-12)
   * @param {number} day 公历日
   * @param {number} hour 出生时辰中心对应的北京时小时(0-23，可为小数)
   * @param {number} lng 出生地经度(东经为正)
   * @returns {{localMeanHour:number, trueSolarHour:number, eot:number, year:number, month:number, day:number, hour:number}}
   */
  function compute(year, month, day, hour, lng) {
    const utcDate = new Date(Date.UTC(year, month - 1, day));
    const eot = equationOfTime(utcDate); // 分钟
    const localMean = hour - (120 - lng) * 4 / 60; // 小时
    const ts = localMean + eot / 60; // 真太阳时（小时，可能跨 0/24）

    let dayOffset = Math.floor(ts / 24);
    let h = ts - dayOffset * 24;
    const base = new Date(Date.UTC(year, month - 1, day));
    base.setUTCDate(base.getUTCDate() + dayOffset);

    return {
      localMeanHour: localMean,
      trueSolarHour: h,
      eot: eot,
      year: base.getUTCFullYear(),
      month: base.getUTCMonth() + 1,
      day: base.getUTCDate(),
      hour: h
    };
  }

  // 小时(0-24) → 时辰地支（子 23–1、丑 1–3 ... 亥 21–23）
  function hourToZhi(h) {
    let hh = ((h % 24) + 24) % 24;
    const idx = Math.floor((hh + 1) / 2) % 12;
    return '子丑寅卯辰巳午未申酉戌亥'[idx];
  }

  // 时辰地支 → 中心小时（用于把用户所选时辰转为北京时小时参与计算）
  const ZHI_HOUR_CENTER = { 子: 0, 丑: 2, 寅: 4, 卯: 6, 辰: 8, 巳: 10, 午: 12, 未: 14, 申: 16, 酉: 18, 戌: 20, 亥: 22 };

  return { compute, equationOfTime, hourToZhi, ZHI_HOUR_CENTER };
});
