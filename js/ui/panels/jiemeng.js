/*
 * jiemeng.js — 解梦 UI 面板
 */
(function () {
  'use strict';
  const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };

  window.PANELS = window.PANELS || {};
  window.PANELS['jiemeng'] = function () {
    const wrap = el('div', 'form-wrap');
    wrap.appendChild(el('h2', null, '解梦 · 梦象词典'));
    wrap.appendChild(el('p', 'muted', '输入梦境中的核心事物（如"水""掉牙""蛇""考试"），可模糊匹配多条。亦可输入"梦见……"整句，会自动提取关键词。'));

    const f = el('div', 'profile-form');
    const r1 = el('div', 'field');
    r1.innerHTML = '<label>梦境关键词</label>';
    const inp = el('input'); inp.type = 'text'; inp.id = 'jm-kw'; inp.placeholder = '如：梦见掉牙 / 蛇 / 飞 / 结婚'; inp.value = '梦见掉牙';
    r1.appendChild(inp); f.appendChild(r1);
    wrap.appendChild(f);

    const btn = el('button', 'primary', '开始解梦');
    btn.onclick = run;
    wrap.appendChild(btn);

    const report = el('div', 'report'); report.id = 'jm-report';
    wrap.appendChild(report);
    return wrap;
  };

  function run() {
    const kw = (document.getElementById('jm-kw').value || '').trim();
    if (!kw) { alert('请输入梦境关键词'); return; }
    let r;
    try { r = window.JieMeng.compute({ keyword: kw }); }
    catch (e) { alert(e.message); return; }
    render(r);
    const rep = document.getElementById('jm-report');
    if (rep && rep.scrollIntoView) rep.scrollIntoView({ behavior: 'smooth' });
  }

  function render(r) {
    const box = document.getElementById('jm-report');
    box.innerHTML = '';

    const det = el('details', 'card principle');
    det.open = true;
    det.innerHTML = '<summary>命理科普（先看这里）</summary><pre>' + window.JieMengData.PRINCIPLES + '</pre>';
    box.appendChild(det);

    const info = el('div', 'card');
    info.innerHTML = '<h3>解梦结果</h3>' +
      row('输入', r.keyword) +
      (r.cleaned ? row('提取关键词', r.cleaned) : '') +
      (r.generic ? '<p class="warn">未匹配到具体梦象，已给出通用建议。</p>'
        : '<p>共匹配到 <b>' + r.count + '</b> 条梦象解读。</p>');
    box.appendChild(info);

    if (r.generic) {
      const g = el('div', 'card');
      g.innerHTML = '<h3>通用建议</h3><pre class="poem">' + r.genericText + '</pre>';
      box.appendChild(g);
    } else {
      r.results.forEach(x => {
        const c = el('div', 'card');
        c.innerHTML = '<h3>' + x.word + ' <span class="tag">' + x.cat + '</span></h3>' +
          '<p>' + x.meaning + '</p>' +
          (x.alias && x.alias.length ? '<p class="muted">同义/相关：' + x.alias.join('、') + '</p>' : '');
        box.appendChild(c);
      });
    }

    box.appendChild(window.BaiHua.jiemeng(r));
    box.appendChild(el('p', 'disclaimer', '免责声明：本工具仅供娱乐与文化研究，所有结果不代表任何医疗、财务、法律或人生建议。请理性看待，切勿迷信。'));
  }

  function row(k, v) { return '<div class="kv"><span class="k">' + k + '</span><span class="v">' + v + '</span></div>'; }
})();
