/*
 * shengxiao.js — 生肖关系计算核心（纯逻辑，无 DOM）
 * 依赖：wuxing.js（地支→生肖）、data/shengxiao.js（关系映射）
 * 输入：compute({ yearZhi, shengxiao?, refYear })
 *   yearZhi：年支（如 '子'），可由 BaZi.compute(...).pillars.yearGZ[1] 取得
 *   refYear：出生公历年份（用于推算未来本命年/犯太岁年份）
 */
(function (root, factory) {
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = factory(require('./wuxing.js'), require('../data/shengxiao.js'));
  } else {
    root.ShengXiao = factory(window.WuXing, window.ShengXiaoData);
  }
})(typeof self !== 'undefined' ? self : this, function (WuXing, Data) {
  const ZHI = Data.ZHI;
  const SHENGXIAO = Data.SHENGXIAO;

  // 由公历年份求年支（立春分界近似：甲子=1984，公式 (year-4)%12）
  function yearZhiFromYear(y) {
    const idx = (((y - 4) % 12) + 12) % 12;
    return ZHI[idx];
  }

  // 在某关系中找与 zhi 配对/同组的其他地支
  function findOthers(zhi, table) {
    const out = [];
    table.forEach(group => {
      const i = group.indexOf(zhi);
      if (i >= 0) {
        if (group.length === 1) out.push(group[0]); // 自刑（单支组）
        else for (let k = 0; k < group.length; k++) if (k !== i) out.push(group[k]);
      }
    });
    return out;
  }

  function compute(input) {
    const { yearZhi, shengxiao, refYear } = input;
    if (!yearZhi || ZHI.indexOf(yearZhi) < 0) throw new Error('请提供有效的年支 yearZhi（如 "子"）');
    const sx = shengxiao || SHENGXIAO[yearZhi] || '?';

    const sanHe = findOthers(yearZhi, Data.SAN_HE);
    const liuHe = findOthers(yearZhi, Data.LIU_HE);
    const liuChong = findOthers(yearZhi, Data.LIU_CHONG);
    const liuHai = findOthers(yearZhi, Data.LIU_HAI);
    const sanXing = findOthers(yearZhi, Data.SAN_XING);
    const liuPo = findOthers(yearZhi, Data.LIU_PO);

    const toSx = (arr) => arr.map(z => ({ zhi: z, shengxiao: SHENGXIAO[z] }));

    // 本命年：未来 6 个地支回到自身的年份
    const benmingYears = [];
    if (typeof refYear === 'number') {
      let n = 0, y = refYear;
      while (benmingYears.length < 6 && n < 200) {
        if (yearZhiFromYear(y) === yearZhi && y > refYear) benmingYears.push(y);
        y++;
        n++;
      }
    }

    // 犯太岁年份：未来若干年内，年支与本人年支呈 值/冲/刑/害/破 关系
    const taiSuiYears = [];
    if (typeof refYear === 'number') {
      for (let y = refYear + 1; y <= refYear + 12 && taiSuiYears.length < 8; y++) {
        const z = yearZhiFromYear(y);
        if (z === yearZhi) taiSuiYears.push({ year: y, type: '值太岁（本命年）', zhi: z });
        else if (liuChong.indexOf(z) >= 0) taiSuiYears.push({ year: y, type: '冲太岁', zhi: z });
        else if (sanXing.indexOf(z) >= 0) taiSuiYears.push({ year: y, type: '刑太岁', zhi: z });
        else if (liuHai.indexOf(z) >= 0) taiSuiYears.push({ year: y, type: '害太岁', zhi: z });
        else if (liuPo.indexOf(z) >= 0) taiSuiYears.push({ year: y, type: '破太岁', zhi: z });
      }
    }

    return {
      yearZhi, shengxiao: sx,
      sanHe: toSx(sanHe),
      liuHe: toSx(liuHe),
      liuChong: toSx(liuChong),
      liuHai: toSx(liuHai),
      sanXing: toSx(sanXing),
      liuPo: toSx(liuPo),
      benmingYears,
      taiSuiYears,
      relationText: Data.REL_DESC
    };
  }

  return { compute, yearZhiFromYear };
});
