/*
 * cezi.js — 测字核心（纯逻辑，无 DOM 依赖）
 * 依赖：window.CeZiData（js/data/cezi.js）
 * 输入：{ char }  —— 一个汉字
 * 输出对象见 compute 返回值
 */
(function (root, factory) {
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = factory();
  } else {
    root.CeZi = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  function getData() {
    if (typeof window !== 'undefined' && window.CeZiData) return window.CeZiData;
    if (typeof CeZiData !== 'undefined') return CeZiData;
    return null;
  }

  // 由字符串生成稳定伪随机种子
  function seedOf(s) {
    let h = 0;
    for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
    return h;
  }
  function pick(arr, seed) { return arr[seed % arr.length]; }

  // 吉平凶倾向文案
  const TENDENCY = [
    { t: '吉', word: '此字气象清朗，主顺遂向上，所问多可成。' },
    { t: '吉', word: '字中藏旺气，谋事有贵人扶，宜进取。' },
    { t: '平', word: '此字中正平和，凡事守常则安，宜稳不宜冒。' },
    { t: '平', word: '字象平稳，无大起伏，顺其自然可也。' },
    { t: '凶', word: '此字锋芒或隐缺，主小阻，宜谨慎守成、三思后行。' },
    { t: '凶', word: '字中带扰动之象，所谋或有反复，宜缓图之。' }
  ];

  // 占断句式（信则有风格）
  const PHRASES = [
    '以字形观之，{struct}之体主{structDesc}；其五行属{wuxing}，{wuxingDesc}。',
    '拆而视之：{decomp}。此中含{meaning}之意，正合所问之机。',
    '谐音取象，"{char}"通"{homo}"，暗藏{homoHint}之兆。',
    '统而断之：{tendency}然字由心造，事在人为，{faith}。'
  ];
  const FAITH = [
    '信则有，不信则淡，权作茶余一乐',
    '心诚则灵，亦不可执着于一字之判',
    '梦笔生花终是幻，踏实前行方为真',
    '此乃触机之戏，吉凶自在人心'
  ];

  function buildKnown(info, char) {
    const D = getData();
    const wd = D.WUXING_DESC[info.wuxing] || '';
    const sd = D.STRUCT_DESC[info.struct] || '';
    const seed = seedOf(char + info.py);
    const tendency = pick(TENDENCY, seed);

    // 拆解演示
    let decomp;
    if (info.parts && info.parts.length) decomp = char + ' 可拆为 ' + info.parts.join(' ＋ ');
    else decomp = char + ' 为独体之字，浑然一体，不可再分（"加减离合"之妙，正在于此）';

    const homoHint = info.homo || '变化';
    const divination = [
      '以字形观之，' + (info.struct || '独体') + '之体主' + sd + '；其五行属' + info.wuxing + '，' + wd + '。',
      '拆而视之：' + decomp + '。此中含「' + info.meaning + '」之意，正合所问之机。',
      '谐音取象，"' + char + '"通"' + info.homo + '"，暗藏' + homoHint + '之兆。',
      '统而断之：' + tendency.word + '然字由心造，事在人为，' + pick(FAITH, seed >>> 3) + '。'
    ].join('\n');

    return {
      char, known: true,
      py: info.py, strokes: info.strokes, radical: info.radical,
      struct: info.struct, wuxing: info.wuxing, meaning: info.meaning,
      parts: info.parts || [], homo: info.homo,
      wuxingDesc: wd, structDesc: sd, decomp, tendency: tendency.t, divination
    };
  }

  function buildUnknown(char) {
    const seed = seedOf(char);
    const tendency = pick(TENDENCY, seed);
    const faith = pick(FAITH, seed >>> 2);
    // 以 Unicode 码点粗估五行与结构，纯创意
    const code = char.charCodeAt(0);
    const wx = ['木', '火', '土', '金', '水'][code % 5];
    const wd = getData().WUXING_DESC[wx] || '';
    const structs = ['独体', '上下', '左右', '半包围', '全包围'];
    const st = structs[code % structs.length];
    const sd = getData().STRUCT_DESC[st] || '';
    const divination = [
      '（此字未入内置字库，以下为创意联想，仅供娱乐）',
      '以字形观之，' + st + '之体主' + sd + '；其五行约属' + wx + '，' + wd + '。',
      '拆字之戏，重在触机：' + char + ' 笔意自有气象，可借当下所问之事自由引申。',
      '统而断之：' + tendency.word + '然字由心造，事在人为，' + faith + '。'
    ].join('\n');
    return {
      char, known: false,
      py: '（库外字）', strokes: '（库外字）', radical: '（库外字）',
      struct: st, wuxing: wx, meaning: '（库外字，未收录字义）',
      parts: [], homo: '（库外字）',
      wuxingDesc: wd, structDesc: sd, decomp: char + ' 暂未收录精确拆解',
      tendency: tendency.t, divination
    };
  }

  function compute(input) {
    const D = getData();
    if (!D) throw new Error('测字数据未加载');
    let raw = (input && input.char) || '';
    raw = String(raw).trim();
    if (!raw) throw new Error('请输入一个汉字');
    const char = raw[0]; // 取首字

    if (D.CHARS[char]) return buildKnown(D.CHARS[char], char);
    return buildUnknown(char);
  }

  return { compute, seedOf };
});
