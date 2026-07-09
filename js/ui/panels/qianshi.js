/*
 * qianshi.js — 前世今生 UI 面板（娱乐向）
 */
(function () {
  'use strict';
  const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };

  window.PANELS = window.PANELS || {};
  window.PANELS['qianshi'] = function () {
    const wrap = el('div', 'form-wrap');
    wrap.appendChild(el('h2', null, '前世今生 · 娱乐生成'));
    wrap.appendChild(el('p', 'muted', '填生日与/或姓名（随意填写也可），算法据此生成一段"前世"故事。本模块纯属创意娱乐，不代表任何宗教或轮回主张。'));

    const f = el('div', 'profile-form');
    const r1 = el('div', 'field');
    r1.innerHTML = '<label>生日（任意文本，如 1990-05-20）</label>';
    const d = el('input'); d.type = 'text'; d.id = 'qs-date';
    d.value = (document.getElementById('p-date') || {}).value || '1990-05-20';
    d.placeholder = '随意填写也可'; r1.appendChild(d); f.appendChild(r1);

    const r2 = el('div', 'field');
    r2.innerHTML = '<label>姓名（可选）</label>';
    const n = el('input'); n.type = 'text'; n.id = 'qs-name';
    n.value = (document.getElementById('p-name') || {}).value || ''; n.placeholder = '如：张三（可留空）';
    r2.appendChild(n); f.appendChild(r2);
    wrap.appendChild(f);

    const btn = el('button', 'primary', '窥探前世（娱乐）');
    btn.onclick = run;
    wrap.appendChild(btn);

    const report = el('div', 'report'); report.id = 'qs-report';
    wrap.appendChild(report);
    return wrap;
  };

  function run() {
    const date = (document.getElementById('qs-date').value || '').trim();
    const name = (document.getElementById('qs-name').value || '').trim();
    if (!date && !name) { alert('请至少填写生日或姓名其一'); return; }
    let r;
    try { r = window.QianShi.compute({ name, birthday: date }); }
    catch (e) { alert(e.message); return; }
    render(r);
    const rep = document.getElementById('qs-report');
    if (rep && rep.scrollIntoView) rep.scrollIntoView({ behavior: 'smooth' });
  }

  function render(r) {
    const box = document.getElementById('qs-report');
    box.innerHTML = '';

    const det = el('details', 'card principle');
    det.open = true;
    det.innerHTML = '<summary>命理科普（先看这里）</summary><pre>' + window.QianShiData.PRINCIPLES + '</pre>';
    box.appendChild(det);

    const info = el('div', 'card');
    info.innerHTML = '<h3>前世档案</h3>' +
      row('前世之名', r.name) +
      row('所处时代', r.era) +
      row('前世身份', r.identity) +
      row('性情', r.trait) +
      row('结局', r.fate) +
      row('前世契合指数', r.score + ' / 100（娱乐）') +
      '<p class="muted">输入：生日 ' + r.inputUsed.birthday + ' ｜ 姓名 ' + r.inputUsed.name + '（种子 ' + r.seed + '，结果稳定可复现）</p>';
    box.appendChild(info);

    const st = el('div', 'card');
    st.innerHTML = '<h3>前世故事</h3><pre class="poem">' + r.story + '</pre>';
    box.appendChild(st);

    const lk = el('div', 'card');
    lk.innerHTML = '<h3>与今生的联系</h3><p>' + r.link + '</p>';
    box.appendChild(lk);

    const nt = el('div', 'card');
    nt.innerHTML = '<p class="muted">' + r.note + '</p>';
    box.appendChild(nt);

    box.appendChild(window.BaiHua.qianshi(r));
    box.appendChild(el('p', 'disclaimer', '免责声明：本工具仅供娱乐与文化研究，所有结果不代表任何医疗、财务、法律或人生建议。请理性看待，切勿迷信。'));
  }

  function row(k, v) { return '<div class="kv"><span class="k">' + k + '</span><span class="v">' + v + '</span></div>'; }
})();
