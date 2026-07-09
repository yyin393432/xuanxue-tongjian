/*
 * qimen.js — 奇门遁甲排盘核心（纯逻辑，无 DOM 依赖，简化版）
 * 依赖：lunar.js、qimen.js（数据）
 * 输入：{ year, month, day, hour(0-23) }
 * 输出：节气/阴阳遁/三元/局数 + 九宫三盘（地盘三奇六仪、天盘九星、人盘八门、八神）。
 */
(function (root, factory) {
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = factory(require('../vendor/lunar.js'), require('../data/qimen.js'));
  } else {
    root.QiMen = factory(window.Lunar ? { Solar: window.Solar, Lunar: window.Lunar, LunarUtil: window.LunarUtil } : null, window.QiMenData);
  }
})(typeof self !== 'undefined' ? self : this, function (LunarLib, D) {
  const { Solar } = LunarLib;
  const { JIEQI_DUN, PALACES, ZHI_TO_GONG, STAR_SEQ, STAR_HOME, MEN_SEQ, MEN_HOME, SHEN_SEQ, SANQI, YUAN_BY_GAN, GRID } = D;

  function mod(n, m) { return ((n % m) + m) % m; }

  function compute(input) {
    const { year, month, day, hour } = input;
    const solar = Solar.fromYmdHms(year, month, day, hour != null ? hour : 0, 0, 0);
    const lunar = solar.getLunar();
    const dayGZ = lunar.getDayInGanZhiExact();
    const timeGZ = lunar.getTimeInGanZhi();
    const dayGan = dayGZ[0], timeGan = timeGZ[0], timeZhi = timeGZ[1];

    // —— 定局：找当前所处节气（拆补法：交节即换局）——
    const table = lunar.getJieQiTable();
    const inputYmd = solar.toYmd();
    let curName = null, curYmd = null;
    for (const name in table) {
      const ymd = table[name].toYmd();
      if (ymd <= inputYmd && (!curYmd || ymd > curYmd)) { curYmd = ymd; curName = name; }
    }
    let dun = JIEQI_DUN.find(e => e[0] === curName);
    if (!dun) dun = ['冬至', false, [1, 7, 4]];
    const yin = dun[1];
    const yuanKey = YUAN_BY_GAN[dayGan] || '上';
    const yuanIdx = { 上: 0, 中: 1, 下: 2 }[yuanKey];
    const ju = dun[2][yuanIdx];

    // —— 地盘三奇六仪 ——
    const diPan = {};
    for (let i = 0; i < 9; i++) {
      const p = yin ? mod((ju - 1 - i), 9) + 1 : mod((ju - 1 + i), 9) + 1;
      diPan[p] = SANQI[i];
    }

    // —— 天盘九星（值符随时干；时干为甲则遁入六仪：甲子戊/甲戌己/甲申庚/甲午辛/甲辰壬/甲寅癸）——
    const JIA_MAP = { 子: '戊', 戌: '己', 申: '庚', 午: '辛', 辰: '壬', 寅: '癸' };
    const shiGanReal = (timeGan === '甲') ? (JIA_MAP[timeZhi] || '戊') : timeGan;
    let shiGanGong = 1;
    for (let p = 1; p <= 9; p++) if (diPan[p] === shiGanReal) { shiGanGong = p; break; }
    const shiGanGongEff = (shiGanGong === 5 ? 2 : shiGanGong); // 中宫寄坤
    const valueStar = STAR_HOME[shiGanGongEff];
    const baseIdx = shiGanGongEff - 1; // 值符在 STAR_SEQ 中的索引
    const tianPan = {};
    for (let p = 1; p <= 9; p++) {
      const delta = p - shiGanGongEff;
      const s = mod(yin ? (baseIdx - delta) : (baseIdx + delta), 9);
      tianPan[p] = STAR_SEQ[s];
    }

    // —— 人盘八门（值使随时支；洛书环序 1,2,3,4,6,7,8,9 跳过中宫）——
    const zhiShiMen = MEN_HOME[shiGanGongEff];        // 值使门
    const shiZhiGong = ZHI_TO_GONG[timeZhi];          // 时支落宫
    const menBaseIdx = MEN_SEQ.indexOf(zhiShiMen);
    const menRing = [1, 2, 3, 4, 6, 7, 8, 9];
    const renPan = { 5: '—' };
    const mstart = menRing.indexOf(shiZhiGong);
    for (let i = 0; i < 8; i++) {
      const p = menRing[mod(mstart + (yin ? -i : i), 8)];
      renPan[p] = MEN_SEQ[mod(menBaseIdx + i, 8)];
    }

    // —— 八神（值符起，阳顺阴逆，不入中宫）——
    const ring = yin ? [9, 8, 7, 6, 4, 3, 2, 1] : [1, 2, 3, 4, 6, 7, 8, 9];
    const shenPan = {};
    const start = ring.indexOf(shiGanGongEff);
    for (let i = 0; i < 8; i++) {
      const p = ring[mod(start + i, 8)];
      shenPan[p] = SHEN_SEQ[i];
    }

    // —— 组装九宫格 ——
    const cells = [];
    for (let p = 1; p <= 9; p++) {
      cells.push({
        gong: p, name: PALACES[p].name, dir: PALACES[p].dir,
        di: diPan[p], tian: tianPan[p], men: renPan[p], shen: shenPan[p] || '',
        isValueStar: tianPan[p] === valueStar,
        isZhiShi: renPan[p] === zhiShiMen
      });
    }

    return {
      input, solarText: year + '年' + month + '月' + day + '日' + (hour != null ? (hour + '时') : ''),
      jieqi: curName, yin, yinText: yin ? '阴遁' : '阳遁', yuan: yuanKey, ju,
      dayGZ, timeGZ, timeGan, timeZhi,
      valueStar, zhiShiMen, shiGanGong: shiGanGongEff,
      cells, GRID
    };
  }

  return { compute };
});
