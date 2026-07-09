/*
 * wuxing.js — 五行 / 天干地支 / 十神 基础数据（纯逻辑，无 DOM 依赖）
 * 可在浏览器(全局 WuXing)与 Node(module.exports) 双环境运行。
 */
(function (root, factory) {
  if (typeof module !== 'undefined' && module.exports) module.exports = factory();
  else root.WuXing = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  const GAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
  const ZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

  // 天干五行与阴阳（1=阳, -1=阴）
  const GAN_WUXING = { 甲: '木', 乙: '木', 丙: '火', 丁: '火', 戊: '土', 己: '土', 庚: '金', 辛: '金', 壬: '水', 癸: '水' };
  const GAN_YINYANG = { 甲: 1, 乙: -1, 丙: 1, 丁: -1, 戊: 1, 己: -1, 庚: 1, 辛: -1, 壬: 1, 癸: -1 };

  // 地支本气五行
  const ZHI_WUXING = { 子: '水', 丑: '土', 寅: '木', 卯: '木', 辰: '土', 巳: '火', 午: '火', 未: '土', 申: '金', 酉: '金', 戌: '土', 亥: '水' };

  // 地支藏干（本气 / 中气 / 余气）
  const ZHI_CANG = {
    子: ['癸'],
    丑: ['己', '癸', '辛'],
    寅: ['甲', '丙', '戊'],
    卯: ['乙'],
    辰: ['戊', '乙', '癸'],
    巳: ['丙', '戊', '庚'],
    午: ['丁', '己'],
    未: ['己', '丁', '乙'],
    申: ['庚', '壬', '戊'],
    酉: ['辛'],
    戌: ['戊', '辛', '丁'],
    亥: ['壬', '甲']
  };

  // 生肖（地支 -> 生肖）
  const ZHI_SHENGXIAO = { 子: '鼠', 丑: '牛', 寅: '虎', 卯: '兔', 辰: '龙', 巳: '蛇', 午: '马', 未: '羊', 申: '猴', 酉: '鸡', 戌: '狗', 亥: '猪' };

  // 五行生克
  const WUXING_SHENG = { 木: '火', 火: '土', 土: '金', 金: '水', 水: '木' };
  const WUXING_KE = { 木: '土', 火: '金', 土: '水', 金: '木', 水: '火' };

  const WUXING_ORDER = ['木', '火', '土', '金', '水'];

  // 六十甲子
  const JIAZI = [];
  for (let i = 0; i < 60; i++) JIAZI.push(GAN[i % 10] + ZHI[i % 12]);

  function jiaziIndex(gz) { return JIAZI.indexOf(gz); }

  // 十神：以日干(me)为"我"，推算 other 干的十神
  function shiShen(me, other) {
    const wMe = GAN_WUXING[me], wO = GAN_WUXING[other];
    const sameYin = GAN_YINYANG[me] === GAN_YINYANG[other];
    if (wMe === wO) return sameYin ? '比肩' : '劫财';
    if (WUXING_SHENG[wMe] === wO) return sameYin ? '食神' : '伤官';
    if (WUXING_KE[wMe] === wO) return sameYin ? '偏财' : '正财';
    if (WUXING_KE[wO] === wMe) return sameYin ? '七杀' : '正官';
    if (WUXING_SHENG[wO] === wMe) return sameYin ? '偏印' : '正印';
    return '?';
  }

  // 天干五行计数
  function countGanWuxing(gans) {
    const m = { 木: 0, 火: 0, 土: 0, 金: 0, 水: 0 };
    gans.filter(Boolean).forEach(g => { m[GAN_WUXING[g]]++; });
    return m;
  }

  return {
    GAN, ZHI, GAN_WUXING, GAN_YINYANG, ZHI_WUXING, ZHI_CANG, ZHI_SHENGXIAO,
    WUXING_SHENG, WUXING_KE, WUXING_ORDER, JIAZI, jiaziIndex, shiShen, countGanWuxing
  };
});
