/*
 * shuzi.js — 数字能量（八星）计算核心（纯逻辑，无 DOM 依赖）
 * 依赖：data/shuzi.js（八星映射表，挂 window.ShuZiData 或在 Node 下 require）
 * 输入：compute({ number })  number 可为字符串/数字（手机号、车牌、QQ 等任意数字串）
 * 输出：清洗后的数字、两两分组（从右往左，尾号组最优先）、每组的星曜解读、整体吉凶概览。
 */
(function (root, factory) {
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = factory(require('../data/shuzi.js'));
  } else {
    root.ShuZi = factory(window.ShuZiData);
  }
})(typeof self !== 'undefined' ? self : this, function (Data) {
  const { STARS, PAIR_TO_STAR, LEVEL_DESC } = Data;

  // 其它（含 0 等不在标准八星表内）的组合
  const OTHER_STAR = {
    key: 'other', name: '其它组合', level: '平',
    desc: '含 0 等不在标准八星表内的组合。能量学中常作「隐性 / 伏位」处理，需结合整体号码判断。',
    advice: '中性，结论请结合相邻吉凶星综合判断，不宜单看。'
  };

  function compute(input) {
    const raw = (input && input.number != null) ? ('' + input.number) : '';
    const digits = raw.replace(/\D/g, '');
    if (!digits) throw new Error('请输入至少一位数字（手机号 / 车牌等）');

    // 从右往左两两分组（尾号组影响最大）
    const rev = digits.split('').reverse();
    const groups = [];
    for (let i = 0; i < rev.length; i += 2) {
      const a = rev[i];
      const b = rev[i + 1];
      if (b === undefined) {
        groups.push({ pair: a, pos: '前缀孤立位', single: true, star: OTHER_STAR });
      } else {
        const pair = b + a; // 还原为原顺序的两位数
        const key = PAIR_TO_STAR[pair];
        groups.push({
          pair: pair,
          pos: groups.length === 0 ? '尾号组（影响最大）' : (i >= rev.length - 4 ? '后段' : '前段'),
          single: false,
          star: key ? STARS[key] : OTHER_STAR,
          matched: !!key
        });
      }
    }

    // 统计吉凶
    let ji = 0, xiong = 0, ping = 0;
    const hit = { tianyi: 0, yannian: 0, shengqi: 0, fuwei: 0, liusha: 0, huohai: 0, wugui: 0, jueming: 0, other: 0 };
    groups.forEach(g => {
      const lv = g.star.level;
      if (lv === '吉') ji++; else if (lv === '凶') xiong++; else ping++;
      hit[g.star.key]++;
    });

    // 整体概览
    let overview;
    if (ji >= xiong + 1 && ji > 0) overview = '吉星占优，整体偏旺、顺遂；可留意凶星所在位置的建议。';
    else if (xiong >= ji + 1) overview = '凶星偏多，整体需更谨慎；注意情绪、财务与沟通，善用吉星化解。';
    else overview = '吉凶相当，平稳中带波动；建议结合具体组合位置综合判断。';

    const tail = groups.length ? groups[0] : null;

    return {
      input: raw,
      cleaned: digits,
      length: digits.length,
      groups,
      count: { ji, xiong, ping },
      starsHit: hit,
      overview,
      tailGroup: tail ? { pair: tail.pair, star: tail.star.name, level: tail.star.level } : null,
      levelDesc: LEVEL_DESC
    };
  }

  return { compute };
});
