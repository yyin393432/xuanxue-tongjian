/*
 * mianxiang.js — 面相/手相/痣相 UI 面板（引导式多选）
 */
(function () {
  'use strict';
  const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };

  window.PANELS = window.PANELS || {};
  window.PANELS['mianxiang'] = function () {
    const wrap = el('div', 'form-wrap');
    wrap.appendChild(el('h2', null, '面相 · 手相 · 痣相'));
    wrap.appendChild(el('p', 'muted', '勾选你关注的部位（可多选），并为每个部位选一种形态，点击"生成综合报告"。相不独论，勾得越多越全面。'));

    const form = el('div', 'profile-form');
    form.id = 'mx-form';

    const G = window.MianXiangData.GROUPS;
    Object.keys(G).forEach(gk => {
      const grp = G[gk];
      const sec = el('div', 'mx-group');
      sec.innerHTML = '<h3 class="mx-gtitle">' + grp.title + '</h3>';
      Object.keys(grp.items).forEach(ik => {
        const it = grp.items[ik];
        const rowEl = el('div', 'mx-row');
        const cb = el('input'); cb.type = 'checkbox'; cb.id = 'mx-cb-' + gk + '-' + ik; cb.dataset.g = gk; cb.dataset.k = ik;
        const lbl = el('label', 'mx-label');
        lbl.appendChild(cb);
        lbl.appendChild(document.createTextNode(' ' + it.name));
        const sel = el('select'); sel.id = 'mx-sel-' + gk + '-' + ik;
        Object.keys(it.states).forEach(st => sel.appendChild(new Option(st, st)));
        rowEl.appendChild(lbl);
        rowEl.appendChild(sel);
        sec.appendChild(rowEl);
      });
      form.appendChild(sec);
    });
    wrap.appendChild(form);

    const btn = el('button', 'primary', '生成综合报告');
    btn.onclick = run;
    wrap.appendChild(btn);

    const report = el('div', 'report'); report.id = 'mx-report';
    wrap.appendChild(report);
    return wrap;
  };

  function run() {
    const boxes = document.querySelectorAll('#mx-form input[type=checkbox]');
    const selections = [];
    boxes.forEach(cb => {
      if (cb.checked) {
        const g = cb.dataset.g, k = cb.dataset.k;
        const state = document.getElementById('mx-sel-' + g + '-' + k).value;
        selections.push({ group: g, key: k, state });
      }
    });
    if (!selections.length) { alert('请至少勾选一个部位'); return; }
    let r;
    try { r = window.MianXiang.compute({ selections }); }
    catch (e) { alert(e.message); return; }
    render(r);
    const rep = document.getElementById('mx-report');
    if (rep && rep.scrollIntoView) rep.scrollIntoView({ behavior: 'smooth' });
  }

  function render(r) {
    const box = document.getElementById('mx-report');
    box.innerHTML = '';

    const det = el('details', 'card principle');
    det.open = true;
    det.innerHTML = '<summary>命理科普（先看这里）</summary><pre>' + window.MianXiangData.PRINCIPLES + '</pre>';
    box.appendChild(det);

    const info = el('div', 'card');
    info.innerHTML = '<h3>已选部位（' + r.count + ' 项）</h3>';
    box.appendChild(info);

    // 按组聚合
    const byGroup = {};
    r.items.forEach(it => { (byGroup[it.groupTitle] = byGroup[it.groupTitle] || []).push(it); });
    Object.keys(byGroup).forEach(gt => {
      const c = el('div', 'card');
      let h = '<h3>' + gt + '</h3><ul class="rel">';
      byGroup[gt].forEach(it => {
        h += '<li><b>' + it.name + '</b> · <span class="tag">' + it.state + '</span><br>' +
          '<span class="muted">' + it.desc + '</span><br>' + it.interp + '</li>';
      });
      h += '</ul>';
      c.innerHTML = h;
      box.appendChild(c);
    });

    const syn = el('div', 'card');
    syn.innerHTML = '<h3>综合建议</h3><p>' + r.synthesis + '</p>';
    box.appendChild(syn);

    box.appendChild(window.BaiHua.mianxiang(r));
    box.appendChild(el('p', 'disclaimer', '免责声明：本工具仅供娱乐与文化研究，所有结果不代表任何医疗、财务、法律或人生建议。请理性看待，切勿迷信。'));
  }
})();
