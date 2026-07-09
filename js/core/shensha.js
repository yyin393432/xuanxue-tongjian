/*
 * shensha.js — 八字神煞推算（纯逻辑，无 DOM 依赖）
 * 依据《渊海子平》《三命通会》通行查法，按「命中数量」计数，并标注命中于哪一柱、查法来源。
 *
 * 口径说明（已在报告透明展示，便于核对）：
 *  - 桃花/驿马/华盖/将星/劫煞/灾煞：以「年支、日支」分别查（三合局对应位），取并集。
 *  - 天乙贵人/文昌：以「年干、日干」分别查，取并集（年干力量大、日干力量小）。
 *  - 羊刃：以「日干」取帝旺之位（甲卯 乙寅 丙戊午 丁己巳 庚酉 辛申 壬子 癸亥）。
 *  - 孤辰/寡宿：以「年支」查。
 *  - 天德/月德：以「月支」查，干支混合（对应字为天干则查天干，为地支则查地支）。
 *  - 空亡（旬空）：按「日柱」所在旬。
 * 注：神煞为传统命理术语，仅供文化研究与娱乐参考。
 */
(function (root, factory) {
  if (typeof module !== 'undefined' && module.exports) module.exports = factory(require('./wuxing.js'));
  else root.Shensha = factory(window.WuXing);
})(typeof self !== 'undefined' ? self : this, function (WuXing) {
  const GAN_SET = '甲乙丙丁戊己庚辛壬癸';
  const ZHI_SET = '子丑寅卯辰巳午未申酉戌亥';

  // ===== 按「年支/日支」查的三合局映射表 =====
  // 寅午戌、申子辰、亥卯未、巳酉丑 四组
  const ZHI_MAP = {
    TAOHUA:   { 寅: '卯', 午: '卯', 戌: '卯', 申: '酉', 子: '酉', 辰: '酉', 亥: '子', 卯: '子', 未: '子', 巳: '午', 酉: '午', 丑: '午' }, // 咸池
    YIMA:     { 申: '寅', 子: '寅', 辰: '寅', 寅: '申', 午: '申', 戌: '申', 巳: '亥', 酉: '亥', 丑: '亥', 亥: '巳', 卯: '巳', 未: '巳' }, // 驿马
    HUAGAI:   { 寅: '戌', 午: '戌', 戌: '戌', 申: '辰', 子: '辰', 辰: '辰', 巳: '丑', 酉: '丑', 丑: '丑', 亥: '未', 卯: '未', 未: '未' }, // 华盖
    JIANGXING:{ 寅: '午', 午: '午', 戌: '午', 申: '子', 子: '子', 辰: '子', 巳: '酉', 酉: '酉', 丑: '酉', 亥: '卯', 卯: '卯', 未: '卯' }, // 将星（三合中神）
    JIESHA:   { 寅: '亥', 午: '亥', 戌: '亥', 申: '巳', 子: '巳', 辰: '巳', 巳: '寅', 酉: '寅', 丑: '寅', 亥: '申', 卯: '申', 未: '申' }, // 劫煞
    ZAISHA:   { 寅: '子', 午: '子', 戌: '子', 申: '午', 子: '午', 辰: '午', 巳: '卯', 酉: '卯', 丑: '卯', 亥: '酉', 卯: '酉', 未: '酉' }  // 灾煞
  };

  // ===== 按「年干/日干」查 =====
  // 天乙贵人：甲戊庚牛羊(丑未) 乙己鼠猴乡(子申) 丙丁猪鸡位(亥酉) 壬癸兔蛇藏(卯巳) 六辛逢马虎(午寅)
  const GUIREN = { 甲: '丑未', 戊: '丑未', 庚: '丑未', 乙: '子申', 己: '子申', 丙: '亥酉', 丁: '亥酉', 壬: '卯巳', 癸: '卯巳', 辛: '午寅' };
  // 文昌：甲乙巳午 丙戊申 丁己酉 庚亥 辛子 壬寅 癸卯
  const WENCHANG = { 甲: '巳', 乙: '午', 丙: '申', 戊: '申', 丁: '酉', 己: '酉', 庚: '亥', 辛: '子', 壬: '寅', 癸: '卯' };
  // 羊刃（日干帝旺位）：甲卯 乙寅 丙戊午 丁己巳 庚酉 辛申 壬子 癸亥
  const YANGREN = { 甲: '卯', 乙: '寅', 丙: '午', 戊: '午', 丁: '巳', 己: '巳', 庚: '酉', 辛: '申', 壬: '子', 癸: '亥' };

  // ===== 按「年支」查 =====
  const GUCHEN = { 寅: '巳', 卯: '巳', 辰: '巳', 巳: '申', 午: '申', 未: '申', 申: '亥', 酉: '亥', 戌: '亥', 亥: '寅', 子: '寅', 丑: '寅' };
  const GUASU  = { 寅: '丑', 卯: '丑', 辰: '丑', 巳: '辰', 午: '辰', 未: '辰', 申: '未', 酉: '未', 戌: '未', 亥: '戌', 子: '戌', 丑: '戌' };

  // ===== 按「月支」查（干支混合）=====
  // 天德：寅丁 卯申 辰壬 巳辛 午亥 未甲 申癸 酉寅 戌丙 亥乙 子巳 丑庚
  const TIANDE = { 寅: '丁', 卯: '申', 辰: '壬', 巳: '辛', 午: '亥', 未: '甲', 申: '癸', 酉: '寅', 戌: '丙', 亥: '乙', 子: '巳', 丑: '庚' };
  // 月德：寅午戌月丙 申子辰月壬 亥卯未月甲 巳酉丑月庚
  const YUEDE = { 寅: '丙', 午: '丙', 戌: '丙', 申: '壬', 子: '壬', 辰: '壬', 亥: '甲', 卯: '甲', 未: '甲', 巳: '庚', 酉: '庚', 丑: '庚' };

  // 旬空表：甲子旬戌亥空 ... 甲寅旬子丑空（按日柱所在甲子旬）
  function kongWang(jiaziIdx) {
    const xun = Math.floor(jiaziIdx / 10); // 0..5
    const map = [['戌', '亥'], ['申', '酉'], ['午', '未'], ['辰', '巳'], ['寅', '卯'], ['子', '丑']];
    return map[xun] || [];
  }

  /**
   * @param {Object} o 四柱干支
   * @param {string} o.yearGZ 年柱干支（如 "庚午"）
   * @param {string} o.monthGZ 月柱
   * @param {string} o.dayGZ 日柱
   * @param {string|null} o.timeGZ 时柱（时辰不详为 null）
   * @returns {Array<{name,target,count,hits,detail}>}
   */
  function compute(o) {
    const yearGZ = o.yearGZ, monthGZ = o.monthGZ, dayGZ = o.dayGZ, timeGZ = o.timeGZ || null;
    const yearGan = yearGZ[0], yearZhi = yearGZ[1];
    const monthGan = monthGZ[0], monthZhi = monthGZ[1];
    const dayGan = dayGZ[0], dayZhi = dayGZ[1];
    const timeGan = timeGZ ? timeGZ[0] : null, timeZhi = timeGZ ? timeGZ[1] : null;

    // 四柱地支 + 标签（用于命中说明）
    const zhiPillars = [['年', yearZhi], ['月', monthZhi], ['日', dayZhi]];
    if (timeZhi) zhiPillars.push(['时', timeZhi]);
    // 四柱干支 + 标签（用于天德/月德混合查）
    const ganZhiPillars = [['年', yearGan], ['月', monthGan], ['日', dayGan]];
    if (timeGan) ganZhiPillars.push(['时', timeGan]);

    // 仅在「地支」中命中
    function hitZhi(targets) {
      const hits = [];
      targets.split('').forEach(c => {
        zhiPillars.forEach(p => { if (p[1] === c) hits.push(p[0] + '支(' + c + ')'); });
      });
      return hits;
    }
    // 干支混合命中（对应字为天干查天干，为地支查地支）
    function hitGanZhi(targets) {
      const hits = [];
      targets.split('').forEach(c => {
        if (GAN_SET.indexOf(c) >= 0) {
          ganZhiPillars.forEach(p => { if (p[1] === c) hits.push(p[0] + '干(' + c + ')'); });
        } else {
          zhiPillars.forEach(p => { if (p[1] === c) hits.push(p[0] + '支(' + c + ')'); });
        }
      });
      return hits;
    }
    // 合并去重两个来源的 target 字符串
    function mergeTargets(a, b) {
      const all = (a + b).split('');
      const u = []; all.forEach(c => { if (u.indexOf(c) < 0) u.push(c); });
      return u.join('');
    }

    const out = [];

    // —— 年支+日支查（桃花/驿马/华盖/将星/劫煞/灾煞）——
    function checkZhi(name, map, ref) {
      const tY = map[yearZhi] || '';
      const tD = map[dayZhi] || '';
      const target = mergeTargets(tY, tD);
      const hits = hitZhi(target);
      const src = [];
      if (tY) src.push('年支' + yearZhi + '→' + tY);
      if (tD) src.push('日支' + dayZhi + '→' + tD);
      return { name, target, count: hits.length, hits, detail: ref + '（' + src.join('；') + '）' };
    }
    out.push(checkZhi('桃花(咸池)', ZHI_MAP.TAOHUA, '年支/日支三合局所临地支'));
    out.push(checkZhi('驿马', ZHI_MAP.YIMA, '年支/日支三合局之驿马位'));
    out.push(checkZhi('华盖', ZHI_MAP.HUAGAI, '年支/日支三合局之华盖位'));
    out.push(checkZhi('将星', ZHI_MAP.JIANGXING, '年支/日支三合局中神'));
    out.push(checkZhi('劫煞', ZHI_MAP.JIESHA, '年支/日支三合局之劫煞位'));
    out.push(checkZhi('灾煞', ZHI_MAP.ZAISHA, '年支/日支三合局之冲位(灾煞)'));

    // —— 年干+日干查（天乙贵人/文昌）——
    function checkGan(name, map, ref) {
      const tY = map[yearGan] || '';
      const tD = map[dayGan] || '';
      const target = mergeTargets(tY, tD);
      const hits = hitZhi(target);
      const src = [];
      if (tY) src.push('年干' + yearGan + '→' + tY);
      if (tD) src.push('日干' + dayGan + '→' + tD);
      return { name, target, count: hits.length, hits, detail: ref + '（' + src.join('；') + '）' };
    }
    out.push(checkGan('天乙贵人', GUIREN, '年干/日干之贵人地支'));
    out.push(checkGan('文昌', WENCHANG, '年干/日干之文昌位'));

    // —— 日干查（羊刃，帝旺位）——
    {
      const t = YANGREN[dayGan] || '';
      const hits = hitZhi(t);
      out.push({ name: '羊刃', target: t, count: hits.length, hits, detail: '日干' + dayGan + '之帝旺位（' + t + '）' });
    }

    // —— 年支查（孤辰/寡宿）——
    {
      const t1 = GUCHEN[yearZhi] || '';
      out.push({ name: '孤辰', target: t1, count: hitZhi(t1).length, hits: hitZhi(t1), detail: '年支' + yearZhi + '之孤辰位（' + t1 + '）' });
      const t2 = GUASU[yearZhi] || '';
      out.push({ name: '寡宿', target: t2, count: hitZhi(t2).length, hits: hitZhi(t2), detail: '年支' + yearZhi + '之寡宿位（' + t2 + '）' });
    }

    // —— 月支查（天德/月德，干支混合）——
    {
      const t1 = TIANDE[monthZhi] || '';
      const h1 = hitGanZhi(t1);
      out.push({ name: '天德贵人', target: t1, count: h1.length, hits: h1, detail: '月支' + monthZhi + '之天德（' + t1 + '）' });
      const t2 = YUEDE[monthZhi] || '';
      const h2 = hitGanZhi(t2);
      out.push({ name: '月德贵人', target: t2, count: h2.length, hits: h2, detail: '月支' + monthZhi + '之月德（' + t2 + '）' });
    }

    // —— 空亡（日柱旬空）——
    {
      const idx = WuXing.jiaziIndex(dayGan + dayZhi);
      const kong = kongWang(idx);
      const hits = hitZhi(kong.join(''));
      out.push({ name: '空亡(旬空)', target: kong.join(''), count: hits.length, hits, detail: '日柱' + dayGZ + '属' + ['甲子', '甲戌', '甲申', '甲午', '甲辰', '甲寅'][Math.floor(idx / 10)] + '旬，空' + kong.join('、') });
    }

    return out;
  }

  return { compute, kongWang };
});
