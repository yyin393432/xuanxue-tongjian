/*
 * shengri.js — 生日/生命灵数 UI 面板（读取档案 #p-date，调用 core 渲染）
 */
(function () {
  'use strict';
  const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };

  window.PANELS = window.PANELS || {};
  window.PANELS['shengri'] = function () {
    const wrap = el('div', 'form-wrap');
    wrap.appendChild(el('h2', null, '生日 · 生命灵数'));
    wrap.appendChild(el('p', 'muted', '信息取自上方「个人档案」的公历出生日期。点击下方测算。'));

    const btn = el('button', 'primary', '开始测算（生命灵数）');
    btn.onclick = run;
    wrap.appendChild(btn);

    const report = el('div', 'report'); report.id = 'shengri-report';
    wrap.appendChild(report);
    return wrap;
  };

  function run() {
    const date = document.getElementById('p-date').value;
    if (!date) { alert('请在上方档案填写出生日期'); return; }
    const [y, mo, d] = date.split('-').map(Number);
    const r = window.ShengRi.compute({ year: y, month: mo, day: d });
    render(r);
    const rep = document.getElementById('shengri-report');
    if (rep && rep.scrollIntoView) rep.scrollIntoView({ behavior: 'smooth' });
  }

  function render(r) {
    const box = document.getElementById('shengri-report');
    box.innerHTML = '';

    const det = el('details', 'card principle');
    det.open = true;
    det.innerHTML = '<summary>命理科普（先看这里）</summary><pre>' + window.ShengRiData.PRINCIPLES + '</pre>';
    box.appendChild(det);

    const info = el('div', 'card');
    info.innerHTML = '<h3>基本信息</h3>' +
      row('出生日期', r.year + ' 年 ' + r.month + ' 月 ' + r.day + ' 日');
    box.appendChild(info);

    const life = el('div', 'card');
    const isMaster = [11, 22, 33].indexOf(r.lifeNumber) >= 0;
    life.innerHTML = '<h3>生命灵数（主命数）· ' + r.lifeNumber + (isMaster ? '（大师数）' : '') + '</h3>' +
      '<p>' + r.lifeText + '</p>';
    box.appendChild(life);

    const bday = el('div', 'card');
    bday.innerHTML = '<h3>生日密码（生日数）· ' + r.birthdayNumber + '</h3>' +
      '<p>' + r.birthdayText + '</p>';
    box.appendChild(bday);

    const ch = el('div', 'card');
    let h = '<h3>挑战数（人生课题）</h3><ul class="rel">';
    r.challenges.forEach(c => {
      h += '<li><b>' + c.name + '：' + c.value + '</b><br><span class="muted">' + c.desc + '</span></li>';
    });
    h += '</ul>';
    ch.innerHTML = h;
    box.appendChild(ch);

    box.appendChild(window.BaiHua.shengri(r));
    box.appendChild(el('p', 'disclaimer', '免责声明：本工具仅供娱乐与文化研究，所有结果不代表任何医疗、财务、法律或人生建议。请理性看待，切勿迷信。'));
  }

  function row(k, v) { return '<div class="kv"><span class="k">' + k + '</span><span class="v">' + v + '</span></div>'; }
})();
