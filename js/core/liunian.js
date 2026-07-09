/*
 * liunian.js — 流年运势 计算核心（纯逻辑，无 DOM 依赖）
 * 依赖：core/bazi.js、core/wuxing.js、vendor/lunar.js、core/truesolar.js、data/shengxiao.js、data/liunian.js
 * 功能：起大运（起运岁数依 性别+年干阴阳+月柱顺逆）+ 未来若干年流年干支 + 与日干/五行/日支/年支作用 + 犯太岁。
 */
(function (root, factory) {
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = factory(
      require('./bazi.js'), require('./wuxing.js'), require('../vendor/lunar.js'),
      require('./truesolar.js'), require('../data/shengxiao.js'), require('../data/liunian.js')
    );
  } else {
    root.LiuNian = factory(
      window.BaZi, window.WuXing, { Solar: window.Solar, Lunar: window.Lunar },
      window.TrueSolar, window.ShengXiaoData, window.LiuNianData
    );
  }
})(typeof self !== 'undefined' ? self : this, function (BaZi, WuXing, LunarLib, TrueSolar, SX, Data) {
  const { Solar } = LunarLib;
  const { GAN_ACT_DESC, TAISUI_DESC, DAYZHI_DESC } = Data;

  function inPair(p, a, b) { return (p[0] === a && p[1] === b) || (p[0] === b && p[1] === a); }
  function relOf(a, b) {
    if (a === b) return 'benming'; // 值太岁（本命）/ 伏吟
    for (const p of SX.LIU_HE) if (inPair(p, a, b)) return 'liuhe';
    for (const g of SX.SAN_HE) if (g.indexOf(a) >= 0 && g.indexOf(b) >= 0) return 'sanhe';
    for (const p of SX.LIU_CHONG) if (inPair(p, a, b)) return 'chong';
    for (const p of SX.LIU_HAI) if (inPair(p, a, b)) return 'hai';
    for (const g of SX.SAN_XING) if (g.length > 1 && g.indexOf(a) >= 0 && g.indexOf(b) >= 0) return 'xing';
    for (const p of SX.LIU_PO) if (inPair(p, a, b)) return 'po';
    return 'none';
  }

  function compute(input) {
    const { year, month, day, hour, gender, longitude, birthplace, name } = input;
    const bz = BaZi.compute(input);

    // 重建 lunar（与 bazi 一致：真太阳时校正）
    let sy = year, sm = month, sd = day, sh = (hour != null ? hour : 0);
    if (hour != null && longitude != null) {
      const ts = TrueSolar.compute(year, month, day, hour, longitude);
      sy = ts.year; sm = ts.month; sd = ts.day; sh = Math.floor(ts.hour);
    } else if (hour == null) {
      sh = 12; // 时辰不详时按午时估算用于起运计数（误差极小）
    }
    const solar = Solar.fromYmdHms(sy, sm, sd, sh, 0, 0);
    const lunar = solar.getLunar();

    // 年干阴阳 → 顺逆
    const yearGan = lunar.getYearInGanZhiExact()[0];
    const yangYear = WuXing.GAN_YINYANG[yearGan] === 1;
    const male = gender === '男';
    const forward = (yangYear && male) || (!yangYear && !male); // 阳男阴女顺

    // 起运：数到最近「节」
    const jie = forward ? lunar.getNextJie(true) : lunar.getPrevJie(true);
    const days = Math.round(jie.getSolar().getJulianDay() - lunar.getSolar().getJulianDay());
    const startAge = Math.abs(days) / 3; // 起运岁数恒为正：顺逆只影响大运排列方向
    const startAgeRounded = Math.round(startAge * 10) / 10;

    // 大运：从月柱顺/逆推
    const mIdx = WuXing.jiaziIndex(bz.pillars.monthGZ);
    const dayuns = [];
    const N = 8;
    for (let k = 1; k <= N; k++) {
      let idx;
      if (forward) idx = (mIdx + k) % 60;
      else idx = ((mIdx - k) % 60 + 60) % 60;
      const gz = WuXing.JIAZI[idx];
      const ageStart = startAge + (k - 1) * 10;
      const ageEnd = ageStart + 10;
      dayuns.push({
        index: k, gz,
        ageStart: Math.round(ageStart * 10) / 10,
        ageEnd: Math.round(ageEnd * 10) / 10,
        yearStartApprox: year + Math.round(ageStart)
      });
    }

    // 流年：未来 years 年（fromYear 默认今年）
    const fromYear = input.fromYear || new Date().getFullYear();
    const years = input.years || 10;
    const dayGan = bz.dayGan;
    const dayZhi = bz.pillars.dayGZ[1];
    const yearZhiNative = bz.pillars.yearGZ[1];

    const liunians = [];
    for (let i = 0; i < years; i++) {
      const Y = fromYear + i;
      const yGZ = Solar.fromYmd(Y, 6, 1).getLunar().getYearInGanZhiExact();
      const yG = yGZ[0], yZ = yGZ[1];
      const ganAct = WuXing.shiShen(dayGan, yG);
      const taiSui = relOf(yZ, yearZhiNative);
      const dayZhiRel = relOf(yZ, dayZhi);
      const age = Y - year; // 近似周岁
      // 当值大运
      let curDayun = null;
      for (const dy of dayuns) {
        if (age >= dy.ageStart && age < dy.ageEnd) { curDayun = dy; break; }
      }
      liunians.push({
        year: Y,
        age: age,
        gz: yGZ,
        gan: yG, zhi: yZ,
        ganAct,
        ganActDesc: GAN_ACT_DESC[ganAct] || '',
        taiSui,
        taiSuiDesc: TAISUI_DESC[taiSui] || '',
        dayZhiRel,
        dayZhiDesc: DAYZHI_DESC[dayZhiRel] || '',
        dayun: curDayun ? curDayun.gz : '（未起运/超出大运表）'
      });
    }

    return {
      input,
      bazi: bz,
      yearGan, yangYear, male, forward,
      startAge: startAgeRounded,
      jieText: forward ? '顺排（向未来节气）' : '逆排（向过去节气）',
      jieDays: days,
      dayuns,
      fromYear, years,
      liunians,
      dayGan, dayZhi, yearZhiNative
    };
  }

  return { compute, relOf };
});
