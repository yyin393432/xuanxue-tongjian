/*
 * hemwei.js — 八字合婚 计算核心（纯逻辑，无 DOM 依赖）
 * 依赖：core/bazi.js（排双方八字）、core/wuxing.js、data/shengxiao.js（地支关系）、core/xingzuo.js + data/xingzuo.js
 * 输入：compute({ p1:{year,month,day,hour,gender,name,...}, p2:{...} })
 * 输出：生肖关系、日柱（干五合/支关系）、五行互补、十神互补、星座配对、综合评分与要点。
 */
(function (root, factory) {
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = factory(
      require('./bazi.js'), require('./wuxing.js'), require('../data/shengxiao.js'),
      require('./xingzuo.js'), require('../data/xingzuo.js'), require('../data/hemwei.js')
    );
  } else {
    root.HemWei = factory(
      window.BaZi, window.WuXing, window.ShengXiaoData,
      window.XingZuo, window.XingZuoData, window.HemWeiData
    );
  }
})(typeof self !== 'undefined' ? self : this, function (BaZi, WuXing, SX, XingZuo, XingZuoData, HW) {
  const { GAN_WU_HE, WEIGHT, GRADE, XINGZUO_ELEM, ELEM_COMPAT, REL_LABEL } = HW;

  function inPair(p, a, b) { return (p[0] === a && p[1] === b) || (p[0] === b && p[1] === a); }

  // 两地支关系（六合/三合/六冲/六害/三刑/六破/无）
  function relationOf(a, b) {
    for (const p of SX.LIU_HE) if (inPair(p, a, b)) return { type: 'liuhe', desc: SX.REL_DESC.liuhe };
    for (const g of SX.SAN_HE) if (g.indexOf(a) >= 0 && g.indexOf(b) >= 0) return { type: 'sanhe', desc: SX.REL_DESC.sanhe };
    for (const p of SX.LIU_CHONG) if (inPair(p, a, b)) return { type: 'chong', desc: SX.REL_DESC.chong };
    for (const p of SX.LIU_HAI) if (inPair(p, a, b)) return { type: 'hai', desc: SX.REL_DESC.hai };
    for (const g of SX.SAN_XING) if (g.length > 1 && g.indexOf(a) >= 0 && g.indexOf(b) >= 0) return { type: 'xing', desc: SX.REL_DESC.xing };
    for (const p of SX.LIU_PO) if (inPair(p, a, b)) return { type: 'po', desc: SX.REL_DESC.po };
    return { type: 'none', desc: '无特殊刑冲合害关系，平。' };
  }

  function dayGanRel(g1, g2) {
    for (const p of GAN_WU_HE) if (inPair(p, g1, g2)) return { score: WEIGHT.dayGan.he, desc: '日干五合（' + g1 + g2 + '），主恩爱和谐、相互吸引。' };
    const w1 = WuXing.GAN_WUXING[g1], w2 = WuXing.GAN_WUXING[g2];
    if (w1 === w2) return { score: WEIGHT.dayGan.bihe, desc: '日干同五行（比和），性格相近、易理解。' };
    if (WuXing.WUXING_SHENG[w1] === w2) return { score: WEIGHT.dayGan.sheng, desc: '日干相生（' + g1 + '生' + g2 + '），主滋养、包容。' };
    if (WuXing.WUXING_SHENG[w2] === w1) return { score: WEIGHT.dayGan.sheng, desc: '日干相生（' + g2 + '生' + g1 + '），主滋养、包容。' };
    if (WuXing.WUXING_KE[w1] === w2) return { score: WEIGHT.dayGan.ke, desc: '日干相克（' + g1 + '克' + g2 + '），主一方较强势，需磨合。' };
    if (WuXing.WUXING_KE[w2] === w1) return { score: WEIGHT.dayGan.beke, desc: '日干相克（' + g2 + '克' + g1 + '），主一方受压，需磨合。' };
    return { score: WEIGHT.dayGan.none, desc: '' };
  }

  function wuxingComplement(wu1, wu2) {
    const order = WuXing.WUXING_ORDER;
    let complementary = 0;
    order.forEach(w => {
      if (wu1[w] <= 0 && wu2[w] >= 2) complementary++;
      if (wu2[w] <= 0 && wu1[w] >= 2) complementary++;
    });
    const score = Math.min(WEIGHT.wuxing, complementary * 4);
    return {
      complementary, score,
      detail: complementary > 0 ? ('双方五行有互补（' + complementary + ' 项：一方所缺恰为另一方所旺），主互助。')
        : '双方五行互补不明显，可看其他维度。'
    };
  }

  function shishenComplement(b1, b2) {
    const s1 = b1.strength, s2 = b2.strength;
    let score, detail;
    if ((s1.indexOf('强') >= 0 && s2.indexOf('弱') >= 0) || (s1.indexOf('弱') >= 0 && s2.indexOf('强') >= 0)) {
      score = WEIGHT.shishen; detail = '日主强弱互补（一强一弱），刚柔并济。';
    } else if (s1.indexOf('中和') >= 0 && s2.indexOf('中和') >= 0) {
      score = Math.round(WEIGHT.shishen * 0.6); detail = '双方日主皆中和，相处平稳。';
    } else {
      score = 2; detail = '日主强弱相近，相处模式需实际沟通调适。';
    }
    return { score, detail };
  }

  function xingzuoRel(k1, k2) {
    const e1 = XINGZUO_ELEM[k1], e2 = XINGZUO_ELEM[k2];
    if (!e1 || !e2) return { score: 0, desc: '（星座数据缺失，娱乐维度从略）' };
    const compat = ELEM_COMPAT[e1] || [];
    if (e1 === e2) return { score: Math.round(WEIGHT.xingzuo * 0.8), desc: '同四象（' + e1 + '），投契。' };
    if (compat.indexOf(e2) >= 0) return { score: WEIGHT.xingzuo, desc: '四象相合（' + e1 + '×' + e2 + '），较投缘（娱乐参考）。' };
    return { score: Math.round(WEIGHT.xingzuo * 0.4), desc: '四象一般（' + e1 + '×' + e2 + '），需多磨合（娱乐参考）。' };
  }

  function compute(input) {
    const p1 = input.p1, p2 = input.p2;
    const b1 = BaZi.compute(p1);
    const b2 = BaZi.compute(p2);

    // 生肖（年支）
    const z1 = b1.pillars.yearGZ[1], z2 = b2.pillars.yearGZ[1];
    const sxRel = relationOf(z1, z2);
    const sxScore = WEIGHT.shengxiao[sxRel.type] || 0;

    // 日柱
    const dayGan1 = b1.dayGan, dayGan2 = b2.dayGan;
    const dz1 = b1.pillars.dayGZ[1], dz2 = b2.pillars.dayGZ[1];
    const dgRel = dayGanRel(dayGan1, dayGan2);
    const dzRel = relationOf(dz1, dz2);
    const dzScore = WEIGHT.dayZhi[dzRel.type] || 0;

    // 五行互补
    const wx = wuxingComplement(b1.totalWu, b2.totalWu);
    // 十神互补
    const ss = shishenComplement(b1, b2);
    // 星座
    let xz1 = null, xz2 = null, xzRel = { score: 0, desc: '' };
    try {
      xz1 = XingZuo.compute({ month: p1.month, day: p1.day });
      xz2 = XingZuo.compute({ month: p2.month, day: p2.day });
      xzRel = xingzuoRel(xz1.key, xz2.key);
    } catch (e) { /* 星座娱乐维度缺失不影响主算 */ }

    const parts = [
      { key: 'shengxiao', label: '生肖（年支）', score: sxScore, detail: b1.shengxiao + '（' + z1 + '） × ' + b2.shengxiao + '（' + z2 + '）：' + (REL_LABEL[sxRel.type] || '') + '。' + sxRel.desc },
      { key: 'dayGan', label: '日干关系', score: dgRel.score, detail: dayGan1 + ' × ' + dayGan2 + '：' + dgRel.desc },
      { key: 'dayZhi', label: '日支关系', score: dzScore, detail: dz1 + ' × ' + dz2 + '：' + (REL_LABEL[dzRel.type] || '') + '。' + dzRel.desc },
      { key: 'wuxing', label: '五行互补', score: wx.score, detail: wx.detail },
      { key: 'shishen', label: '十神/强弱互补', score: ss.score, detail: ss.detail },
      { key: 'xingzuo', label: '星座配对', score: xzRel.score, detail: (xz1 && xz2 ? (xz1.name + ' × ' + xz2.name + '：') : '') + xzRel.desc }
    ];

    const totalPoints = parts.reduce((a, p) => a + p.score, 0);
    let score = Math.round(Math.min(99, Math.max(5, 50 + totalPoints)));
    const grade = GRADE.find(g => score >= g.min).name;

    return {
      p1: { name: b1.name, bazi: b1, shengxiao: b1.shengxiao, dayGZ: b1.pillars.dayGZ, xingzuo: xz1 },
      p2: { name: b2.name, bazi: b2, shengxiao: b2.shengxiao, dayGZ: b2.pillars.dayGZ, xingzuo: xz2 },
      parts,
      totalPoints,
      score,
      grade
    };
  }

  return { compute, relationOf };
});
