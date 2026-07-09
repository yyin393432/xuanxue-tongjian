/*
 * bazi.js — 八字排盘主模块（纯逻辑，无 DOM 依赖）
 * 依赖：lunar.js（历法/节气）、wuxing.js、shensha.js、chenggu.js、truesolar.js
 * 输入：{ year, month, day, hour(0-23|null), gender, longitude(°E|null), birthplace, name }
 *
 * 说明：若提供出生地经度且时辰已知，排盘按「真太阳时」计算——可能跨 23:00/00:00
 * 边界而改变日柱与时辰，这是八字的正确做法（尤其经度偏西地区）。
 */
(function (root, factory) {
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = factory(require('../vendor/lunar.js'), require('./wuxing.js'), require('./shensha.js'), require('./chenggu.js'), require('./truesolar.js'));
  } else {
    root.BaZi = factory(window.Lunar ? { Solar: window.Solar, Lunar: window.Lunar, LunarUtil: window.LunarUtil } : null, window.WuXing, window.Shensha, window.ChengGu, window.TrueSolar);
  }
})(typeof self !== 'undefined' ? self : this, function (LunarLib, WuXing, Shensha, ChengGu, TrueSolar) {
  const { Solar, Lunar, LunarUtil } = LunarLib;

  const CN_NUM = { '一': 1, '二': 2, '三': 3, '四': 4, '五': 5, '六': 6, '七': 7, '八': 8, '九': 9 };
  function parseDayChinese(s) {
    if (!s) return 0;
    if (s === '初十') return 10;
    if (s === '二十') return 20;
    if (s === '三十') return 30;
    if (s.indexOf('初') === 0) return CN_NUM[s[1]] || 0;
    if (s.indexOf('廿') === 0) return 20 + (s.length > 1 ? (CN_NUM[s[1]] || 0) : 0);
    if (s.indexOf('十') === 0) return 10 + (s.length > 1 ? (CN_NUM[s[1]] || 0) : 0);
    return parseInt(s, 10) || 0;
  }

  function compute(input) {
    const { year, month, day, hour, gender, longitude, birthplace, name } = input;

    // ===== 真太阳时校正 =====
    let sy = year, sm = month, sd = day, sh = (hour != null ? hour : 0);
    let trueSolar = null, beijingZhi = null;
    if (hour != null && longitude != null) {
      const ts = TrueSolar.compute(year, month, day, hour, longitude);
      sy = ts.year; sm = ts.month; sd = ts.day; sh = Math.floor(ts.hour);
      trueSolar = {
        year: ts.year, month: ts.month, day: ts.day,
        hourFloat: ts.trueSolarHour, eot: ts.eot, localMean: ts.localMeanHour,
        zhi: TrueSolar.hourToZhi(ts.trueSolarHour)
      };
    }
    if (hour != null) beijingZhi = TrueSolar.hourToZhi(hour);

    const solar = Solar.fromYmdHms(sy, sm, sd, sh, 0, 0);
    const lunar = solar.getLunar();

    const yearGZ = lunar.getYearInGanZhiExact();
    const monthGZ = lunar.getMonthInGanZhiExact();
    const dayGZ = lunar.getDayInGanZhiExact();
    const timeGZ = hour != null ? lunar.getTimeInGanZhi() : null;

    const yearZhi = yearGZ[1], monthZhi = monthGZ[1], dayZhi = dayGZ[1];
    const timeZhi = timeGZ ? timeGZ[1] : null;
    const dayGan = dayGZ[0];

    const shengxiao = lunar.getYearShengXiaoExact();
    const lunarText = lunar.getMonthInChinese() + '月' + lunar.getDayInChinese() + '日';
    const ganZhiYearText = lunar.getYearInGanZhi(); // 农历年（春节分界），仅展示

    // 五行分布
    const gans = [yearGZ[0], monthGZ[0], dayGZ[0], timeGZ ? timeGZ[0] : null];
    const zhis = [yearZhi, monthZhi, dayZhi, timeZhi].filter(Boolean);
    const ganWu = WuXing.countGanWuxing(gans);
    const zhiWu = { 木: 0, 火: 0, 土: 0, 金: 0, 水: 0 };
    zhis.forEach(z => { zhiWu[WuXing.ZHI_WUXING[z]]++; });
    const totalWu = {};
    WuXing.WUXING_ORDER.forEach(w => { totalWu[w] = ganWu[w] + zhiWu[w]; });

    // 藏干明细
    const cangDetail = zhis.map(z => ({ zhi: z, wuxing: WuXing.ZHI_WUXING[z], cangs: WuXing.ZHI_CANG[z] }));

    // 日主强弱（简化版：得令 + 天干比劫/印 + 地支本气根）
    const dayW = WuXing.GAN_WUXING[dayGan];
    let score = 0;
    if (WuXing.ZHI_WUXING[monthZhi] === dayW) score += 2; // 得令
    gans.forEach(g => {
      if (!g) return;
      const w = WuXing.GAN_WUXING[g];
      if (w === dayW) score += 1;
      else if (WuXing.WUXING_SHENG[w] === dayW) score += 0.5; // 印
      else if (WuXing.WUXING_KE[w] === dayW) score -= 0.5; // 官杀
    });
    zhis.forEach(z => {
      WuXing.ZHI_CANG[z].forEach((g, i) => {
        const w = WuXing.GAN_WUXING[g];
        if (w === dayW) score += (i === 0 ? 1 : 0.5);
        else if (WuXing.WUXING_SHENG[w] === dayW) score += (i === 0 ? 0.5 : 0.3);
      });
    });
    let strength = '中和';
    if (score >= 4) strength = '身强（日主偏旺）';
    else if (score <= 1.5) strength = '身弱（日主偏弱）';

    // 十神
    function ss(zhi) { return WuXing.shiShen(dayGan, WuXing.ZHI_CANG[zhi][0]); }
    const shiShenMap = {
      year: { gan: WuXing.shiShen(dayGan, yearGZ[0]), zhi: ss(yearZhi) },
      month: { gan: WuXing.shiShen(dayGan, monthGZ[0]), zhi: ss(monthZhi) },
      day: { zhi: ss(dayZhi) },
      time: timeGZ ? { gan: WuXing.shiShen(dayGan, timeGZ[0]), zhi: ss(timeZhi) } : null
    };

    // 纳音
    const nayin = {
      year: lunar.getYearNaYin(),
      month: lunar.getMonthNaYin(),
      day: lunar.getDayNaYin(),
      time: timeGZ ? LunarUtil.NAYIN[timeGZ] : null
    };

    // 神煞（计数版，口径：年支/日支、年干/日干、月支分别查）
    const shensha = Shensha.compute({ yearGZ, monthGZ, dayGZ, timeGZ });

    // 称骨
    const dayNum = parseDayChinese(lunar.getDayInChinese());
    const chenggu = ChengGu.compute(yearGZ, monthZhi, dayNum, timeZhi);

    return {
      input,
      solarText: year + '年' + month + '月' + day + '日' + (hour != null ? (hour + '时(北京时)') : '（时辰不详）'),
      lunarText, ganZhiYearText,
      shengxiao,
      pillars: { yearGZ, monthGZ, dayGZ, timeGZ },
      dayGan, dayW, strength, score: Math.round(score * 10) / 10,
      ganWu, zhiWu, totalWu, cangDetail,
      shiShenMap, nayin, shensha, chenggu,
      timeUnknown: hour == null,
      trueSolar, beijingZhi, longitude: longitude != null ? longitude : null, birthplace: birthplace || null, name: name || null
    };
  }

  return { compute };
});
