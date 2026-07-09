/*
 * cezi.js — 测字 UI 面板
 */
(function () {
  'use strict';
  const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };

  window.PANELS = window.PANELS || {};
  window.PANELS['cezi'] = function () {
    const wrap = el('div', 'form-wrap');
    wrap.appendChild(el('h2', null, '测字 · 汉字拆解占卜'));
    wrap.appendChild(el('p', 'muted', '输入一个汉字，列出字形结构、部首、笔画、五行与字义，并给出"信则有"风格的创意占断。仅供文化娱乐，切勿当真。'));

    const f = el('div', 'profile-form');
    const r1 = el('div', 'field');
    r1.innerHTML = '<label>一个汉字</label>';
    const inp = el('input'); inp.type = 'text'; inp.id = 'cz-char'; inp.maxLength = 1; inp.placeholder = '如：明 / 福 / 梦'; inp.value = '明';
    r1.appendChild(inp); f.appendChild(r1);
    wrap.appendChild(f);

    const btn = el('button', 'primary', '开始测字');
    btn.onclick = run;
    wrap.appendChild(btn);

    const report = el('div', 'report'); report.id = 'cz-report';
    wrap.appendChild(report);
    return wrap;
  };

  function run() {
    const c = (document.getElementById('cz-char').value || '').trim();
    if (!c) { alert('请输入一个汉字'); return; }
    let r;
    try { r = window.CeZi.compute({ char: c }); }
    catch (e) { alert(e.message); return; }
    render(r);
    const rep = document.getElementById('cz-report');
    if (rep && rep.scrollIntoView) rep.scrollIntoView({ behavior: 'smooth' });
  }

  function render(r) {
    const box = document.getElementById('cz-report');
    box.innerHTML = '';

    const det = el('details', 'card principle');
    det.open = true;
    det.innerHTML = '<summary>命理科普（先看这里）</summary><pre>' + window.CeZiData.PRINCIPLES + '</pre>';
    box.appendChild(det);

    const info = el('div', 'card');
    info.innerHTML = '<h3>字形拆解 ·「' + r.char + '」</h3>' +
      row('拼音', r.py) +
      row('结构', r.struct + (r.structDesc ? '（' + r.structDesc + '）' : '')) +
      row('部首', r.radical) +
      row('笔画', r.strokes) +
      row('五行', r.wuxing + (r.wuxingDesc ? '（' + r.wuxingDesc + '）' : '')) +
      row('字义', r.meaning) +
      (r.parts && r.parts.length ? row('拆分演示', r.decomp) : '') +
      row('谐音联想', r.homo) +
      '<p class="warn">倾向：<b>' + r.tendency + '</b>（创意占断，仅供娱乐）</p>';
    box.appendChild(info);

    const c = el('div', 'card');
    c.innerHTML = '<h3>创意占断 · 信则有</h3><pre class="poem">' + r.divination + '</pre>';
    box.appendChild(c);

    box.appendChild(window.BaiHua.cezi(r));
    box.appendChild(el('p', 'disclaimer', '免责声明：本工具仅供娱乐与文化研究，所有结果不代表任何医疗、财务、法律或人生建议。请理性看待，切勿迷信。'));
  }

  function row(k, v) { return '<div class="kv"><span class="k">' + k + '</span><span class="v">' + v + '</span></div>'; }
})();
