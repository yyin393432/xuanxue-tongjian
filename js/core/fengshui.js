/*
 * fengshui.js — 风水 / 择日 计算核心（纯逻辑，无 DOM 依赖）
 * 依赖：vendor/lunar.js（黄历 API）、data/fengshui.js（建除/八卦/事项映射）
 * 功能：
 *   computeDay({year,month,day})   → 当日黄历（农历、干支、宜、忌、吉神、凶煞、十二建除、黄道黑道、冲煞、彭祖百忌）
 *   baguaDirections()              → 八卦方位民俗简介
 *   selectAuspicious({matter, fromYear, fromMonth, fromDay, days}) → 近期吉日（基于宜忌 + 建除 + 黄道过滤）
 */
(function (root, factory) {
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = factory(require('../vendor/lunar.js'), require('../data/fengshui.js'));
  } else {
    root.FengShui = factory({ Solar: window.Solar, Lunar: window.Lunar }, window.FengShuiData);
  }
})(typeof self !== 'undefined' ? self : this, function (LunarLib, Data) {
  const { Solar } = LunarLib;
  const { ZHIXING_DESC, HUANGDAO, TIANSHEN_DESC, BAGUA, MATTERS, ZHIXING_TEND } = Data;

  function computeDay(input) {
    const { year, month, day } = input;
    const solar = Solar.fromYmd(year, month, day);
    const lunar = solar.getLunar();

    const dayGZ = lunar.getDayInGanZhiExact();
    const zhiXing = lunar.getZhiXing();
    const tianShen = lunar.getDayTianShen();
    const tianShenLuck = lunar.getDayTianShenLuck && lunar.getDayTianShenLuck();
    const isHuangDao = HUANGDAO.indexOf(tianShen) >= 0;
    const chong = lunar.getDayChong();
    const chongSX = lunar.getDayChongShengXiao();
    const sha = lunar.getDaySha();

    const yi = lunar.getDayYi() || [];
    const ji = lunar.getDayJi() || [];
    const jiShen = lunar.getDayJiShen() || [];
    const xiongSha = lunar.getDayXiongSha() || [];

    return {
      solarText: year + '年' + month + '月' + day + '日',
      lunarText: lunar.getYearInGanZhi() + '年 ' + lunar.getMonthInChinese() + '月' + lunar.getDayInChinese() + '日',
      yearGZ: lunar.getYearInGanZhiExact(),
      monthGZ: lunar.getMonthInGanZhiExact(),
      dayGZ: dayGZ,
      nayin: lunar.getDayNaYin(),
      yi,
      ji,
      jiShen,
      xiongSha,
      zhiXing,
      zhiXingInfo: ZHIXING_DESC[zhiXing] || { tend: '中', desc: '' },
      tianShen,
      tianShenLuck: tianShenLuck || (isHuangDao ? '吉' : '凶'),
      isHuangDao,
      tianShenDesc: TIANSHEN_DESC[tianShen] || '',
      chong: chong,
      chongShengXiao: chongSX,
      sha: sha,
      pengZu: (lunar.getPengZuGan() || '') + '；' + (lunar.getPengZuZhi() || '')
    };
  }

  function baguaDirections() {
    return BAGUA.slice();
  }

  function selectAuspicious(input) {
    const matterKey = input.matter;
    const days = input.days || 60;
    const matter = MATTERS.find(m => m.key === matterKey) || MATTERS[0];

    const start = Solar.fromYmd(input.fromYear, input.fromMonth, input.fromDay);
    const results = [];
    for (let i = 0; i < days; i++) {
      const d = start.next(i);
      let info;
      try { info = computeDay({ year: d.getYear(), month: d.getMonth(), day: d.getDay() }); }
      catch (e) { continue; }

      const hitYi = matter.yi.some(k => info.yi.indexOf(k) >= 0);
      if (!hitYi) continue;

      // 评分：建除倾向 + 黄道 + 非破日
      let score = (ZHIXING_TEND[info.zhiXingInfo.tend] || 1);
      if (info.isHuangDao) score += 1;
      if (info.zhiXing === '破') score = 0; // 破日直接排除

      results.push({
        date: d.getYear() + '-' + pad(d.getMonth()) + '-' + pad(d.getDay()),
        dayGZ: info.dayGZ,
        zhiXing: info.zhiXing,
        zhiXingTend: info.zhiXingInfo.tend,
        tianShen: info.tianShen,
        isHuangDao: info.isHuangDao,
        yi: info.yi,
        ji: info.ji,
        chongShengXiao: info.chongShengXiao,
        score
      });
    }
    // 按评分降序、日期升序
    results.sort((a, b) => (b.score - a.score) || (a.date < b.date ? -1 : 1));
    return { matter: matter.name, total: results.length, list: results.slice(0, 10) };
  }

  function pad(n) { return n < 10 ? '0' + n : '' + n; }

  return { computeDay, baguaDirections, selectAuspicious, MATTERS };
});
