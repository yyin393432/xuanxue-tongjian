/*
 * jiemeng.js — 解梦核心（纯逻辑，无 DOM 依赖）
 * 依赖：window.JieMengData（js/data/jiemeng.js）
 * 输入：{ keyword }  —— 梦境关键词（可含"梦见/梦到"等前缀，内部自动清洗）
 * 输出：{ keyword, cleaned, results:[{word,alias,cat,meaning}], count, generic }
 */
(function (root, factory) {
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = factory();
  } else {
    root.JieMeng = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  function getData() {
    if (typeof window !== 'undefined' && window.JieMengData) return window.JieMengData;
    if (typeof JieMengData !== 'undefined') return JieMengData;
    return null;
  }

  // 清洗：去掉常见前缀与标点空格
  function clean(s) {
    if (!s) return '';
    s = String(s).replace(/[\s，。、！？!?,.;；:：'"'"'""''【】()（）\[\]<>《》\-—_]/g, '').trim();
    s = s.replace(/^(我)?(昨晚|今早|刚刚|夜里|晚上)?(梦到|梦见|做梦|梦见了|做了一个梦|做的梦|梦境是|梦到的是)/, '');
    s = s.replace(/^(一个|一场|有关|关于|的)?(梦|梦境)$/, '');
    return s.trim();
  }

  function matchOne(cleaned, entry) {
    const pool = [entry.word].concat(entry.alias || []);
    for (const p of pool) {
      if (!p) continue;
      if (p === cleaned) return true;
      if (p.length >= 2 && cleaned.indexOf(p) >= 0) return true;
      if (cleaned.length >= 2 && p.indexOf(cleaned) >= 0) return true;
    }
    return false;
  }

  function compute(input) {
    const D = getData();
    if (!D) throw new Error('梦象词典未加载');
    const raw = (input && input.keyword) || '';
    const cleaned = clean(raw);
    if (!cleaned) return { keyword: raw, cleaned: '', results: [], count: 0, generic: true, genericText: D.GENERIC };

    const results = D.DREAMS.filter(e => matchOne(cleaned, e))
      .map(e => ({ word: e.word, alias: e.alias || [], cat: e.cat, meaning: e.meaning }));

    if (results.length === 0) {
      return { keyword: raw, cleaned, results: [], count: 0, generic: true, genericText: D.GENERIC };
    }
    return { keyword: raw, cleaned, results, count: results.length, generic: false };
  }

  return { compute, clean };
});
