/*
 * hemwei.js — 合婚 文案 / 评分口径数据（挂 window.HemWeiData）
 * 口径：生肖（六合/三合/六冲/六害/三刑/六破）取《三命通会》标准，与 shengxiao.js 一致；
 * 日柱天干五合、地支关系、五行互补、十神互补为合婚通用要点；星座配对为娱乐参考。
 * 已于 2024-09 WebSearch 核对主流合婚要点（生肖/日柱/五行互补）。
 */
(function (root, factory) {
  if (typeof module !== 'undefined' && module.exports) module.exports = factory();
  else root.HemWeiData = factory();
})(typeof self !== 'undefined' ? self : this, function () {

  const PRINCIPLES =
    '【八字合婚是怎么回事】\n' +
    '合婚是传统婚配参考，主要看双方八字的「和谐度」，常见维度：\n' +
    '· 生肖（年支）：看六合（最投缘）、三合（互助）、六冲（对立）、六害/三刑/六破（不睦）。\n' +
    '· 日柱（代表本人与配偶宫）：日干是否「五合」（甲己、乙庚、丙辛、丁壬、戊癸），日支是否相合/相冲。\n' +
    '· 五行互补：一方所缺恰为另一方所旺，谓之互补，主互助。\n' +
    '· 十神互补：性格角色互补（如官印、财官相生），主相处顺。\n' +
    '· 星座配对：太阳星座四象（火/土/风/水）的娱乐参考，权重较低。\n\n' +
    '【怎么看分数】\n' +
    '分数是各维度加权汇总（0–100），仅供娱乐参考；婚姻幸福更取决于沟通、三观与相处。\n\n' +
    '（以上为民俗文化科普，结果仅供娱乐参考，不代表任何婚恋建议。）';

  // 日干五合
  const GAN_WU_HE = [['甲', '己'], ['乙', '庚'], ['丙', '辛'], ['丁', '壬'], ['戊', '癸']];

  // 维度评分权重（基础分，正负）
  const WEIGHT = {
    shengxiao: { liuhe: 15, sanhe: 13, none: 0, po: -6, hai: -8, xing: -12, chong: -15 },
    dayGan: { he: 12, sheng: 6, bihe: 4, ke: -6, beke: -3, none: 0 },
    dayZhi: { liuhe: 10, sanhe: 9, none: -1, po: -5, hai: -6, xing: -8, chong: -10 },
    wuxing: 12,      // 互补满分
    shishen: 5,      // 十神互补满分
    xingzuo: 8       // 星座满分
  };

  const GRADE = [
    { min: 80, name: '上上（高度契合）' },
    { min: 60, name: '良好（较合拍）' },
    { min: 40, name: '中等（需磨合）' },
    { min: 0, name: '偏弱（多留意）' }
  ];

  // 星座四象（娱乐参考）：火/土/风/水；key 与 data/xingzuo.js 的 SIGNS.key 一致（英文）
  const XINGZUO_ELEM = {
    aries: '火', taurus: '土', gemini: '风', cancer: '水', leo: '火', virgo: '土',
    libra: '风', scorpio: '水', sagittarius: '火', capricorn: '土', aquarius: '风', pisces: '水'
  };
  // 四象配对倾向：同象/相生象更合（火生土、土生金无、风助火、水助木无；用简化互容表）
  const ELEM_COMPAT = {
    '火': ['火', '土', '风'],
    '土': ['土', '火', '水'],
    '风': ['风', '火', '水'],
    '水': ['水', '土', '风']
  };

  const REL_LABEL = {
    liuhe: '六合（最投缘）', sanhe: '三合（互助）', chong: '六冲（对立）',
    hai: '六害（暗不睦）', xing: '三刑（相刑）', po: '六破（相破）', none: '无特殊刑冲合（平）'
  };

  return { PRINCIPLES, GAN_WU_HE, WEIGHT, GRADE, XINGZUO_ELEM, ELEM_COMPAT, REL_LABEL };
});
