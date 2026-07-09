/*
 * xingzuo.js — 太阳星座计算核心（纯逻辑，无 DOM）
 * 依赖：data/xingzuo.js（星座数据与分界）
 * 输入：compute({ month, day }) → 返回对应星座对象（含 name/en/traits/fortune）
 */
(function (root, factory) {
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = factory(require('../data/xingzuo.js'));
  } else {
    root.XingZuo = factory(window.XingZuoData);
  }
})(typeof self !== 'undefined' ? self : this, function (Data) {
  const SIGNS = Data.SIGNS;

  function inRange(m, d, s) {
    if (s.crossYear) {
      return (m === 12 && d >= s.start[1]) || (m === 1 && d <= s.end[1]);
    }
    if (m < s.start[0] || m > s.end[0]) return false;
    if (m === s.start[0] && d < s.start[1]) return false;
    if (m === s.end[0] && d > s.end[1]) return false;
    return true;
  }

  function compute(input) {
    const { month, day } = input;
    if (!(month >= 1 && month <= 12 && day >= 1 && day <= 31)) throw new Error('请提供有效月日');
    const sign = SIGNS.find(s => inRange(month, day, s));
    if (!sign) throw new Error('未匹配到星座（月日超出范围）');
    return {
      month, day,
      key: sign.key,
      name: sign.name,
      en: sign.en,
      traits: sign.traits,
      fortune: sign.fortune
    };
  }

  return { compute };
});
