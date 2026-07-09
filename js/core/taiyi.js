/*
 * taiyi.js — 三式 核心（科普 + 形状级简化示意，非完整排盘）
 * 依赖：window.TaiYiData（js/data/taiyi.js）
 * 提供三个示意函数：
 *   liurenDemo({ dayGan, dayZhi, zhanShi })  —— 大六壬 简化四课三传
 *   taiyiJu({ year })                         —— 太乙 简化局数
 *   tiebanTiao({ dayGan, dayZhi, gender })    —— 铁板 简化条文编号
 * 均明确标注"简化科普"，仅供文化演示。
 */
(function (root, factory) {
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = factory();
  } else {
    root.TaiYi = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  function getData() {
    if (typeof window !== 'undefined' && window.TaiYiData) return window.TaiYiData;
    if (typeof TaiYiData !== 'undefined') return TaiYiData;
    return null;
  }

  const ZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
  const idx = z => ZHI.indexOf(z);
  const up = (z, n) => ZHI[((idx(z) + n) % 12 + 12) % 12];

  // 大六壬 简化四课三传（演示，非九宗门）
  function liurenDemo(input) {
    if (!input || !input.dayZhi) throw new Error('需提供日支');
    const zhi = input.dayZhi;
    const zhan = input.zhanShi || '午';
    const n = idx(zhan); // 简化：以占时地支顺推取上神
    const ganShang = up(zhi, n);
    const zhiShang = up(zhi, n + 3);
    const ganShang2 = up(ganShang, n);
    const zhiShang2 = up(zhiShang, n + 1);

    const siKe = [
      { name: '第一课（干）', top: ganShang, bottom: input.dayGan || zhi },
      { name: '第二课', top: ganShang2, bottom: ganShang },
      { name: '第三课（支）', top: zhiShang, bottom: zhi },
      { name: '第四课', top: zhiShang2, bottom: zhiShang }
    ];
    const sanChuan = [
      { name: '初传（发用）', value: ganShang },
      { name: '中传', value: ganShang2 },
      { name: '末传', value: zhiShang }
    ];
    return {
      mode: 'liuren',
      dayGanZhi: (input.dayGan || '') + zhi,
      zhanShi: zhan,
      siKe, sanChuan,
      note: '演示性简化：上神取"占时地支顺推"，非依月将加占时与九宗门发用。'
    };
  }

  // 太乙 简化局数（演示：以年干支序号示意"阴阳局"）
  function taiyiJu(input) {
    const year = parseInt((input && input.year) || '0', 10) || 0;
    // 太乙以"太乙积年"起算，此处仅以公元年做形状级映射示意
    const ju = ((year - 1015389) % 72 + 72) % 72; // 取 0-71 之数，示意"七十二局"之形
    const yinYang = ju % 2 === 0 ? '阳局' : '阴局';
    return {
      mode: 'taiyi',
      year,
      jv: ju,
      yinYang,
      note: '演示性简化：以公元年对 72 取模示意"局数"之形，非真实太乙积年推演。'
    };
  }

  // 铁板 简化条文编号（演示：以日干支+性别哈希示意）
  function tiebanTiao(input) {
    const gz = ((input && input.dayGan) || '') + ((input && input.dayZhi) || '');
    const gender = (input && input.gender) || '男';
    let h = 0;
    for (let i = 0; i < gz.length; i++) h = (h * 31 + gz.charCodeAt(i)) >>> 0;
    h = (h + (gender === '女' ? 101 : 0)) >>> 0;
    const tiao = (h % 9999) + 1; // 示意条文编号 1-9999
    return {
      mode: 'tieban',
      dayGanZhi: gz,
      gender,
      tiao,
      note: '演示性简化：以日干支+性别哈希出"条文编号"之形，非真实考时定刻与秘本条文。'
    };
  }

  return { liurenDemo, taiyiJu, tiebanTiao, ZHI };
});
