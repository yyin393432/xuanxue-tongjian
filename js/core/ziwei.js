/*
 * ziwei.js — 紫微斗数排盘核心（纯逻辑，无 DOM 依赖）
 * 依赖：lunar.js（历法）、wuxing.js、ziwei.js（数据）
 * 输入：{ year, month, day, hour(0-23|null), gender, ... }
 * 说明：命宫/身宫/五行局/紫微星/十四主星/年干四化，简化演示版（无大限辅曜）。
 */
(function (root, factory) {
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = factory(require('../vendor/lunar.js'), require('./wuxing.js'), require('../data/ziwei.js'));
  } else {
    root.ZiWei = factory(window.Lunar ? { Solar: window.Solar, Lunar: window.Lunar, LunarUtil: window.LunarUtil } : null, window.WuXing, window.ZiWeiData);
  }
})(typeof self !== 'undefined' ? self : this, function (LunarLib, WuXing, ZiWeiData) {
  const { Solar, Lunar, LunarUtil } = LunarLib;
  const { ZIWEI_STARS, TIANFU_STARS, GONG_NAMES, NAYIN_TO_JU, JU_NAME, WUHU_DUN, SIHUA, ZHI } = ZiWeiData;

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

  // 地支 index 工具
  const zhiIdx = (z) => ZHI.indexOf(z);
  const zhiAt = (i) => ZHI[((i % 12) + 12) % 12];

  function compute(input) {
    const { year, month, day, hour, gender, name } = input;
    const solar = Solar.fromYmdHms(year, month, day, (hour != null ? hour : 0), 0, 0);
    const lunar = solar.getLunar();

    const yearGZ = lunar.getYearInGanZhiExact();
    const monthGZ = lunar.getMonthInGanZhiExact();
    const dayGZ = lunar.getDayInGanZhiExact();
    const timeGZ = hour != null ? lunar.getTimeInGanZhi() : null;
    const yearGan = yearGZ[0];
    const monthZhi = monthGZ[1];
    const hourZhi = timeGZ ? timeGZ[1] : null;
    const dayNum = parseDayChinese(lunar.getDayInChinese());

    // —— 命宫/身宫 ——
    const yin = zhiIdx('寅'); // 2
    const monthIdx = (zhiIdx(monthZhi) - yin + 12) % 12 + 1; // 寅=1…丑=12
    const hourIdx = hourZhi ? (zhiIdx(hourZhi) + 1) : null;   // 子=1…亥=12
    const monthGong = (yin + monthIdx - 1) % 12;
    let mingGong, shenGong;
    if (hourIdx != null) {
      mingGong = ((monthGong - (hourIdx - 1)) % 12 + 12) % 12;
      shenGong = (monthGong + (hourIdx - 1)) % 12;
    } else {
      // 时辰不详：命宫暂以月宫（子时起算）近似
      mingGong = monthGong; shenGong = monthGong;
    }

    // —— 五行局（纳音法）——
    const firstGan = WUHU_DUN[yearGan];
    const zhengYueGZ = firstGan + '寅';
    const k = (mingGong - yin + 12) % 12; // 命宫距寅步数
    const zhengIdx = WuXing.jiaziIndex(zhengYueGZ);
    const mingGZ = WuXing.JIAZI[(zhengIdx + k) % 60];
    const nayin = LunarUtil.NAYIN[mingGZ] || '';
    const ju = NAYIN_TO_JU[nayin.charAt(nayin.length - 1)] || 0;

    // —— 紫微星定位 ——
    let ziwei;
    if (dayNum > 0 && ju > 0) {
      const shang = Math.floor((dayNum - 1) / ju) + 1; // 商 = ceil(日/局)
      const yu = shang * ju - dayNum;                   // 余
      const base = (yin + shang - 1) % 12;              // 寅+商-1
      if (yu === 0) ziwei = base;
      else if (yu % 2 === 1) ziwei = ((base - yu) % 12 + 12) % 12;
      else ziwei = (base + yu) % 12;
    } else {
      ziwei = yin; // 兜底
    }
    const tianfu = (ziwei + 6) % 12; // 天府在紫微对宫

    // —— 十四主星落宫 ——
    const starAt = {}; // 宫index -> [stars]
    ZIWEI_STARS.forEach((st, i) => {
      const p = (ziwei - i + 12) % 12; // 逆布
      (starAt[p] = starAt[p] || []).push(st);
    });
    TIANFU_STARS.forEach((st, i) => {
      const p = (tianfu + i) % 12; // 顺布
      (starAt[p] = starAt[p] || []).push(st);
    });

    // —— 年干四化 ——
    const sihua = SIHUA[yearGan] || {};
    const huaAt = {}; // 宫index -> ['廉贞(禄)', ...]
    ['禄', '权', '科', '忌'].forEach(type => {
      const star = sihua[type];
      if (!star) return;
      for (const p in starAt) {
        if (starAt[p].indexOf(star) >= 0) {
          (huaAt[p] = huaAt[p] || []).push(star + '(' + type + ')');
        }
      }
    });

    // —— 组装十二宫 ——
    const gongs = [];
    for (let i = 0; i < 12; i++) {
      const p = (mingGong + i) % 12;
      gongs.push({
        name: GONG_NAMES[i],
        zhi: zhiAt(p),
        stars: starAt[p] || [],
        hua: huaAt[p] || []
      });
    }
    const shenGongName = GONG_NAMES[((shenGong - mingGong) % 12 + 12) % 12];

    return {
      input,
      solarText: year + '年' + month + '月' + day + '日' + (hour != null ? (hour + '时') : '（时辰不详）'),
      yearGZ, monthGZ, dayGZ, timeGZ, dayNum,
      mingGong: { zhi: zhiAt(mingGong), name: '命宫' },
      shenGong: { zhi: zhiAt(shenGong), name: shenGongName },
      mingGZ, nayin, ju, juName: JU_NAME[ju] || '—',
      ziweiZhi: zhiAt(ziwei), tianfuZhi: zhiAt(tianfu),
      gongs,
      sihua,
      gender: gender || null, name: name || null
    };
  }

  return { compute };
});
