/*
 * yijing.js — 易经/梅花易数 核心（纯逻辑，无 DOM 依赖）
 * 依赖：yijing.js（数据）
 * 输入：{ yao:[6个0/1,初→上], dong:[6个0/1动爻] }
 * 输出：本卦（卦名/卦辞/爻辞+动爻）、变卦、动爻辞、上下卦。
 */
(function (root, factory) {
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = factory(require('../data/yijing.js'));
  } else {
    root.YiJing = factory(window.YiJingData);
  }
})(typeof self !== 'undefined' ? self : this, function (D) {
  const { BAGUA, HEXAGRAMS } = D;

  // 八卦 → 三爻（初→三，底→顶）：乾111 兑110 离101 震100 巽011 坎010 艮001 坤000
  function trigramBits(ch) {
    const v = { 乾: 7, 兑: 6, 离: 5, 震: 4, 巽: 3, 坎: 2, 艮: 1, 坤: 0 }[ch];
    return [v & 1, (v >> 1) & 1, (v >> 2) & 1];
  }
  function bitsToTrigram(bits) {
    const v = bits[0] + (bits[1] << 1) + (bits[2] << 2);
    const map = ['坤', '艮', '坎', '巽', '震', '离', '兑', '乾'];
    return map[v];
  }
  function yaoToTrigrams(yao) {
    return {
      down: bitsToTrigram([yao[0], yao[1], yao[2]]),
      up: bitsToTrigram([yao[3], yao[4], yao[5]])
    };
  }
  function findHex(up, down) {
    return HEXAGRAMS.find(h => h.up === up && h.down === down) || null;
  }

  function compute(o) {
    const yao = o.yao.slice();
    const dong = o.dong || yao.map(() => 0);
    const { up, down } = yaoToTrigrams(yao);
    const ben = findHex(up, down);

    const bianYao = yao.map((v, i) => (dong[i] ? (v ? 0 : 1) : v));
    const bt = yaoToTrigrams(bianYao);
    const bian = findHex(bt.up, bt.down);

    const dongPositions = dong.map((d, i) => (d ? i + 1 : null)).filter(Boolean);
    // 用九/用六
    let yongJiu = false, yongLiu = false;
    if (ben && ben.name.indexOf('乾') === 0 && dongPositions.length === 6) yongJiu = true;
    if (ben && ben.name.indexOf('坤') === 0 && dongPositions.length === 6) yongLiu = true;

    const lines = ben ? ben.yao.slice(0, 6).map((txt, i) => ({
      yao: i + 1,
      yang: yao[i],
      txt,
      dong: !!dong[i]
    })) : [];

    return {
      ben: ben ? { name: ben.name, gua: ben.gua, up: ben.up, down: ben.down, idx: ben.i } : null,
      bian: bian ? { name: bian.name, gua: bian.gua, up: bian.up, down: bian.down, idx: bian.i } : null,
      dongPositions,
      yongJiu, yongLiu,
      lines,
      // 动爻辞（本卦动爻 + 变卦对应静爻对照仅给本卦动爻辞）
      dongYaoCi: dongPositions.map(p => ({ yao: p, ci: ben ? ben.yao[p - 1] : '' }))
    };
  }

  // 由上下卦索引(0..7)与动爻(1..6)生成 yao/dong（供数字/时间起卦）
  function fromUpDown(upIdx, downIdx, dong) {
    const up = BAGUA[upIdx], down = BAGUA[downIdx];
    const ub = trigramBits(up), db = trigramBits(down);
    const yao = [db[0], db[1], db[2], ub[0], ub[1], ub[2]];
    const d = [0, 0, 0, 0, 0, 0]; if (dong >= 1 && dong <= 6) d[dong - 1] = 1;
    return { yao, dong: d };
  }

  return { compute, fromUpDown, trigramBits, bitsToTrigram, yaoToTrigrams, findHex };
});
