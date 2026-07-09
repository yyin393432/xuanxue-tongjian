/*
 * shengri.js — 生命灵数 / 生日密码 / 挑战数 计算核心（纯逻辑，无 DOM）
 * 依赖：data/shengri.js（解读文案）
 * 输入：compute({ year, month, day })
 *   口径：生命灵数 = 年月日各位数字相加，反复化简为 1–9；遇 11/22/33 保留为大师数。
 */
(function (root, factory) {
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = factory(require('../data/shengri.js'));
  } else {
    root.ShengRi = factory(window.ShengRiData);
  }
})(typeof self !== 'undefined' ? self : this, function (Data) {
  const MASTER = [11, 22, 33];

  function digitSum(n) {
    let s = 0;
    while (n > 0) { s += n % 10; n = Math.floor(n / 10); }
    return s;
  }

  // 化简为 1–9，途中/终值遇 11/22/33 则保留
  function reduceKeepMaster(n) {
    let v = n;
    while (v > 9 && MASTER.indexOf(v) < 0) v = digitSum(v);
    return v;
  }

  // 化简为 1–9（挑战数用，不留大师数）
  function reduce1to9(n) {
    let v = n;
    while (v > 9) v = digitSum(v);
    return v;
  }

  function compute(input) {
    const { year, month, day } = input;
    if (!(year > 0 && month >= 1 && month <= 12 && day >= 1 && day <= 31))
      throw new Error('请提供有效的公历年月日');

    // 生命灵数（主命数）
    const fullDigits = ('' + year + month + day).split('').map(Number).reduce((a, b) => a + b, 0);
    const lifeNumber = reduceKeepMaster(fullDigits);

    // 生日数（出生日化简，保留 11/22）
    const birthdayNumber = reduceKeepMaster(day);

    // 挑战数：月/日/年 各自化简成个位数（不留大师数）
    const m = reduce1to9(month), d = reduce1to9(day), y = reduce1to9(year);
    const ch1 = Math.abs(m - d);
    const ch2 = Math.abs(d - y);
    const ch3 = Math.abs(ch1 - ch2);
    const ch4 = Math.abs(m - y);

    return {
      year, month, day,
      lifeNumber,
      lifeText: Data.LIFE[lifeNumber] || '',
      birthdayNumber,
      birthdayText: Data.BIRTHDAY[birthdayNumber] || Data.BIRTHDAY[digitSum(birthdayNumber)] || '',
      challenges: [
        { name: '第1挑战（月−日）', value: ch1, desc: Data.CHALLENGE_DESC[ch1] || '' },
        { name: '第2挑战（日−年）', value: ch2, desc: Data.CHALLENGE_DESC[ch2] || '' },
        { name: '第3挑战（前两挑战之差）', value: ch3, desc: Data.CHALLENGE_DESC[ch3] || '' },
        { name: '第4挑战·主挑战（月−年）', value: ch4, desc: Data.CHALLENGE_DESC[ch4] || '' }
      ]
    };
  }

  return { compute, reduceKeepMaster, reduce1to9 };
});
