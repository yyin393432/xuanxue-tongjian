/*
 * xingming.js — 姓名学五格剖象/三才 计算核心（纯逻辑，无 DOM）
 * 依赖：wuxing.js（五行生克）、data/xingming.js（笔画表/五格吉凶/理数五行）
 * 输入：compute({ name, xiYongShen? })
 *   name：汉字姓名（建议 2–4 字）。复姓按内置复姓表识别，其余按单姓处理。
 *   xiYongShen：可选，八字喜用神（五行字，如 '木'），用于简单补益提示。
 */
(function (root, factory) {
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = factory(require('./wuxing.js'), require('../data/xingming.js'));
  } else {
    root.XingMing = factory(window.WuXing, window.XingMingData);
  }
})(typeof self !== 'undefined' ? self : this, function (WuXing, Data) {
  const STROKES = Data.STROKES;
  const WUGE = Data.WUGE;

  // 常见复姓（仅用于切分 姓/名；其笔画若未收录将提示）
  const COMPOUND = ['欧阳', '司马', '上官', '诸葛', '东方', '独孤', '南宫', '慕容', '司徒', '尉迟',
    '长孙', '宇文', '拓跋', '皇甫', '令狐', '夏侯', '申屠', '公孙', '轩辕', '钟离',
    '百里', '澹台', '闾丘', '端木', '万俟', '闻人', '赫连', '宗政', '濮阳', '淳于'];

  function getStroke(ch) { return Object.prototype.hasOwnProperty.call(STROKES, ch) ? STROKES[ch] : null; }

  function wugeLookup(v) {
    const k = v > 81 ? (((v - 1) % 81) + 1) : v;
    return WUGE[k] || ['半吉', '（超出 1–81 标准表，按同余数参看）'];
  }

  // a 对 b 的生克关系判定
  function relation(a, b) {
    if (WuXing.WUXING_SHENG[a] === b) return '吉'; // a 生 b
    if (a === b) return '吉';                       // 比和
    if (WuXing.WUXING_SHENG[b] === a) return '中';  // b 生 a（泄）
    if (WuXing.WUXING_KE[a] === b) return '凶';     // a 克 b
    if (WuXing.WUXING_KE[b] === a) return '凶';     // b 克 a
    return '中';
  }

  function compute(input) {
    const name = (input.name || '').trim();
    if (!name || name.length < 2) throw new Error('请输入至少两个汉字的姓名');

    let sLen = 1;
    if (name.length >= 2 && COMPOUND.indexOf(name.slice(0, 2)) >= 0) sLen = 2;
    const surname = name.slice(0, sLen);
    const given = name.slice(sLen);

    // 逐字笔画
    const chars = [];
    const missing = [];
    for (const ch of name) {
      const st = getStroke(ch);
      chars.push({ char: ch, stroke: st });
      if (st == null) missing.push(ch);
    }
    const sStrokes = surname.split('').map(getStroke);
    const mStrokes = given.split('').map(getStroke);
    const allStrokes = chars.map(c => c.stroke);
    const hasAll = missing.length === 0;

    function grid(value) {
      if (value == null) return null;
      const w = Data.numWuxing(value);
      const [ji, desc] = wugeLookup(value);
      return { value, wuxing: w, ji, desc };
    }

    let tian = null, ren = null, di = null, zong = null, wai = null;
    if (hasAll) {
      // 天格
      tian = (sLen === 1) ? (sStrokes[0] + 1) : (sStrokes[0] + sStrokes[1]);
      // 人格 = 姓末字 + 名首字
      ren = sStrokes[sStrokes.length - 1] + mStrokes[0];
      // 地格 = 名笔画和(+1：单名)
      di = (mStrokes.length === 1) ? (mStrokes[0] + 1) : mStrokes.reduce((a, b) => a + b, 0);
      // 总格
      zong = allStrokes.reduce((a, b) => a + b, 0);
      // 外格
      wai = zong - ren + 1;
    }

    const grids = {
      tian: grid(tian), ren: grid(ren), di: grid(di), wai: grid(wai), zong: grid(zong)
    };

    // 三才
    let sancai = null;
    if (grids.tian && grids.ren && grids.di) {
      const T = grids.tian.wuxing, R = grids.ren.wuxing, D = grids.di.wuxing;
      const r1 = relation(T, R); // 天→人
      const r2 = relation(R, D); // 人→地
      let score = 0;
      [r1, r2].forEach(x => { if (x === '吉') score++; else if (x === '凶') score--; });
      let verdict = '吉';
      if (score === 2) verdict = '大吉';
      else if (score === 0) verdict = '中平';
      else if (score < 0) verdict = '凶';
      const reason = '天格(' + T + ')→人格(' + R + ')：' + r1 + '；人格(' + R + ')→地格(' + D + ')：' + r2 +
        '。三才以"相生/比和"为贵，' + (verdict === '大吉' ? '顺生流通，较为理想。'
          : verdict === '凶' ? '多现相克，宜借后天努力与修养调和。'
            : '吉凶参半，整体平稳。');
      sancai = { tian: T, ren: R, di: D, verdict, reason };
    }

    // 喜用神简易提示
    let xiNote = null;
    if (input.xiYongShen && grids.ren && sancai) {
      const want = input.xiYongShen;
      const hit = [];
      if (grids.ren.wuxing === want) hit.push('人格五行(' + grids.ren.wuxing + ')与喜用神相合');
      if (sancai.tian === want || sancai.di === want) hit.push('三才中有格五行属' + want + '，可补益喜用');
      xiNote = hit.length ? ('姓名五行有助喜用神（' + want + '）：' + hit.join('；') + '。') :
        ('姓名三才五行暂未明显补益喜用神（' + want + '），仅供参考。');
    }

    return {
      name, surname, given, isCompound: sLen === 2,
      chars, missing, hasAll,
      grids, sancai, xiNote
    };
  }

  return { compute };
});
