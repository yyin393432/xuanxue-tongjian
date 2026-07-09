/*
 * liuyao.js — 六爻装卦核心（纯逻辑，无 DOM 依赖）
 * 依赖：wuxing.js（五行/地支五行）、liuyao.js（数据）
 * 输入：{ yao:[6个0/1,初→上], dong:[6个0/1动爻标记], dayGan:占卦日天干 }
 * 输出：本卦/变卦、纳甲、六亲、六神、世应、简断。
 */
(function (root, factory) {
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = factory(require('./wuxing.js'), require('../data/liuyao.js'));
  } else {
    root.LiuYao = factory(window.WuXing, window.LiuYaoData);
  }
})(typeof self !== 'undefined' ? self : this, function (WuXing, D) {
  const { GUAS, BAGUA_WUXING, NADI, NAGAN_INNER, NAGAN_OUTER, BAGONG, SHI_ORDER, LIU_SHEN, SHEN_BY_GAN, liuQin } = D;

  // 三爻（初→三，底→顶）-> 八卦索引 0..7（乾兑离震巽坎艮坤）
  function trigramIndex(bits) {
    const val = bits[0] + (bits[1] << 1) + (bits[2] << 2); // 乾7 兑6 离5 震4 巽3 坎2 艮1 坤0
    return 7 - val;
  }
  function findGua(upIdx, downIdx) {
    for (let i = 0; i < BAGONG.length; i++) {
      const g = BAGONG[i];
      if (g[2] === upIdx && g[3] === downIdx) return { gong: g[0], name: g[1], shi: SHI_ORDER[i % 8], idx: i };
    }
    return null;
  }
  // 爻线文本
  function yaoLine(v) { return v ? '━━━' : '━ ━'; }
  function guaLines(yao) {
    let s = '';
    for (let i = 5; i >= 0; i--) s += yaoLine(yao[i]) + (i === 3 ? '\n' : '') + '\n';
    return s.trim();
  }

  function compute(o) {
    const yao = o.yao.slice();
    const dong = o.dong || yao.map(() => 0);
    const dayGan = o.dayGan || '甲';

    const up = trigramIndex([yao[3], yao[4], yao[5]]);
    const down = trigramIndex([yao[0], yao[1], yao[2]]);
    const ben = findGua(up, down);

    const bianYao = yao.map((v, i) => (dong[i] ? (v ? 0 : 1) : v));
    const bup = trigramIndex([bianYao[3], bianYao[4], bianYao[5]]);
    const bdown = trigramIndex([bianYao[0], bianYao[1], bianYao[2]]);
    const bian = findGua(bup, bdown);

    const gong = ben.gong;
    const gongWx = BAGUA_WUXING[gong];

    // 装卦
    const lines = [];
    for (let i = 0; i < 6; i++) {
      const isOuter = i >= 3;
      const pos = i % 3;
      const zhi = (isOuter ? NADI[gong].outer : NADI[gong].inner)[pos];
      const gan = isOuter ? NAGAN_OUTER[gong] : NAGAN_INNER[gong];
      const wx = WuXing.ZHI_WUXING[zhi];
      const qin = liuQin(gongWx, wx);
      const shenIdx = (SHEN_BY_GAN[dayGan] + i) % 6;
      lines.push({
        yao: i + 1,                 // 初/二…上
        yaoName: ['初', '二', '三', '四', '五', '上'][i] + (yao[i] ? '爻' : '爻'),
        yang: yao[i],
        gan, zhi, ganZhi: gan + zhi,
        wuxing: wx,
        qin,
        shen: LIU_SHEN[shenIdx],
        dong: !!dong[i],
        bianYang: bianYao[i]
      });
    }

    const shi = ben.shi;
    const ying = (shi - 1 + 3) % 6 + 1;

    // 简断（简化）
    const dongCount = dong.filter(Boolean).length;
    const shiLine = lines[shi - 1];
    let duan = '世爻在' + shiLine.yaoName + '（' + shiLine.qin + '），应爻在' + lines[ying - 1].yaoName + '（' + lines[ying - 1].qin + '）。';
    if (dongCount > 0) duan += ' 本卦动爻 ' + dongCount + ' 处（' + dong.map((d, i) => d ? (i + 1) : null).filter(Boolean).join('、') + '爻），主事态有变、动而能迁。';
    else duan += ' 本卦无动爻，主事体暂稳、宜静守。';
    duan += ' 以' + gong + '宫（' + gongWx + '）为体，六亲依宫而定，可据此看财官父兄子之消长。';

    return {
      ben: { name: ben.name, gong, gongWx, up: GUAS[up], down: GUAS[down], lines: guaLines(yao), shi, ying },
      bian: { name: bian.name, gong: bian.gong, up: GUAS[bup], down: GUAS[bdown], lines: guaLines(bianYao) },
      detail: lines,
      dongCount,
      duan,
      dayGan
    };
  }

  // 摇卦：三枚铜钱，老阳(3正)=1动、老阴(3反)=0动、少阳=1静、少阴=0静
  function yaoFromCoins() {
    let heads = 0;
    for (let i = 0; i < 3; i++) heads += Math.random() < 0.5 ? 1 : 0;
    if (heads === 3) return { v: 1, dong: 1 }; // 老阳
    if (heads === 0) return { v: 0, dong: 1 }; // 老阴
    return { v: heads >= 2 ? 1 : 0, dong: 0 };  // 少阳/少阴
  }
  function castByYao() {
    const yao = [], dong = [];
    for (let i = 0; i < 6; i++) { const r = yaoFromCoins(); yao.push(r.v); dong.push(r.dong); }
    return { yao, dong };
  }

  return { compute, castByYao, trigramIndex, findGua };
});
