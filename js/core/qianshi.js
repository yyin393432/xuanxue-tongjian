/*
 * qianshi.js — 前世今生 核心（纯逻辑，无 DOM 依赖，娱乐向）
 * 依赖：window.QianShiData（js/data/qianshi.js）
 * 输入：{ name, birthday }  —— 二者至少其一；生日任意文本，姓名任意文本
 * 输出：{ seed, name(前世名), era, identity, trait, fate, story, link, score, note }
 */
(function (root, factory) {
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = factory();
  } else {
    root.QianShi = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  function getData() {
    if (typeof window !== 'undefined' && window.QianShiData) return window.QianShiData;
    if (typeof QianShiData !== 'undefined') return QianShiData;
    return null;
  }

  function hash(s) {
    s = String(s || '');
    let h = 2166136261 >>> 0;
    for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }
    return h >>> 0;
  }
  function pick(arr, seed) { const i = ((seed % arr.length) + arr.length) % arr.length; return arr[i]; }
  // 从 arr 中"不重复"地取 n 个下标（避免故事中同一句模板被连取两次造成重复行）
  function pickDistinct(arr, seed, n) {
    const total = arr.length;
    const used = [];
    let x = (seed >>> 0) || 1;
    let guard = 0;
    while (used.length < Math.min(n, total) && guard < 200) {
      x = (Math.imul(x, 1103515245) + 12345) >>> 0;
      const i = x % total;
      if (used.indexOf(i) < 0) used.push(i);
      guard++;
    }
    while (used.length < n) used.push(x % total);
    return used;
  }
  function fill(tpl, map) {
    return tpl.replace(/\{(\w+)\}/g, (m, k) => (map[k] != null ? map[k] : m));
  }

  const POSTFIX = ['风起云涌', '太平安乐', '动荡离乱', '温柔静好', '金戈铁马', '烟雨朦胧'];

  function compute(input) {
    const D = getData();
    if (!D) throw new Error('前世数据未加载');
    const name = (input && input.name || '').trim();
    const birthday = (input && input.birthday || '').trim();
    if (!name && !birthday) throw new Error('请至少提供生日或姓名其一');

    // 种子：姓名 + 生日数字
    let digits = (birthday.match(/\d/g) || []).join('');
    if (!digits) digits = String(birthday.length || 0);
    const seed = (hash(name) ^ hash(digits) ^ (parseInt(digits || '0', 10) || 0)) >>> 0;

    const era = pick(D.ERAS, seed);
    const surname = pick(D.SURNAMES, seed >>> 1);
    const given = pick(D.GIVEN, seed >>> 2);
    const identity = pick(D.IDENTITIES, seed >>> 3);
    const trait = pick(D.TRAITS, seed >>> 4);
    const fate = pick(D.FATES, seed >>> 5);
    const event = pick(D.EVENTS, seed >>> 6);
    const sceneHint = pick(D.SCENE_HINTS, seed >>> 7);
    const pastName = surname + given;
    const postfix = pick(POSTFIX, seed >>> 8);

    const map = { era, trait, identity, postfix, scene_hint: sceneHint };
    const sceneIdxs = pickDistinct(D.SCENES, seed, 3);
    let story = '';
    story += fill(D.SCENES[sceneIdxs[0]], map) + '\n';
    story += fill(D.SCENES[sceneIdxs[1]], map) + '\n';
    story += fill(D.SCENES[sceneIdxs[2]], map) + '\n';
    story += '彼时，' + event + '。\n';
    story += '最终，你' + fate + '。';

    const linkMap = { identity, trait, scene_hint: sceneHint };
    const link = fill(pick(D.LINKS, seed >>> 9), linkMap);

    const score = 60 + (seed % 41); // 60-100 娱乐指数

    return {
      seed, name: pastName, era, identity, trait, fate, story, link,
      score, note: D.NOTE, inputUsed: { name: name || '（未填）', birthday: birthday || '（未填）' }
    };
  }

  return { compute };
});
