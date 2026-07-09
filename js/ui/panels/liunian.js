/*
 * liunian.js — 流年运势 UI 面板（档案生日 → 大运 + 未来流年简表）
 */
(function () {
  'use strict';
  const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };

  window.PANELS = window.PANELS || {};
  window.PANELS['liunian'] = function () {
    const wrap = el('div', 'form-wrap');
    wrap.appendChild(el('h2', null, '流年运势 · 大运流年'));
    wrap.appendChild(el('p', 'muted', '信息取自上方「个人档案」。选择起始年份与年数，看大运排盘与逐年流年简表。'));

    const f = el('div', 'profile-form');
    const r1 = el('div', 'field');
    r1.innerHTML = '<label>起始年份（默认今年）</label>';
    const y = el('input'); y.type = 'number'; y.id = 'ln-year'; y.value = new Date().getFullYear();
    r1.appendChild(y); f.appendChild(r1);

    const r2 = el('div', 'field');
    r2.innerHTML = '<label>预测年数</label>';
    const n = el('select'); n.id = 'ln-years';
    [5, 10, 15, 20].forEach(v => n.appendChild(new Option(v + ' 年', String(v))));
    n.value = '10';
    r2.appendChild(n); f.appendChild(r2);
    wrap.appendChild(f);

    const btn = el('button', 'primary', '起运 · 看流年');
    btn.onclick = run;
    wrap.appendChild(btn);

    const report = el('div', 'report'); report.id = 'liunian-report';
    wrap.appendChild(report);
    return wrap;
  };

  function run() {
    const date = document.getElementById('p-date').value;
    if (!date) { alert('请在上方档案填写出生日期'); return; }
    const [y, mo, d] = date.split('-').map(Number);
    const hourSel = document.getElementById('p-hour').value;
    let hour = null;
    if (hourSel !== 'unknown') hour = parseInt(hourSel.replace('est:', ''), 10);
    const gender = (document.querySelector('input[name=gender]:checked') || {}).value || '男';
    const fromYear = parseInt(document.getElementById('ln-year').value, 10) || new Date().getFullYear();
    const years = parseInt(document.getElementById('ln-years').value, 10) || 10;
    const name = (document.getElementById('p-name').value || '').trim();

    const r = window.LiuNian.compute({ year: y, month: mo, day: d, hour, gender, name: name || null, fromYear, years });
    render(r);
    const rep = document.getElementById('liunian-report');
    if (rep && rep.scrollIntoView) rep.scrollIntoView({ behavior: 'smooth' });
  }

  function render(r) {
    const box = document.getElementById('liunian-report');
    box.innerHTML = '';

    const det = el('details', 'card principle');
    det.open = true;
    det.innerHTML = '<summary>命理科普（先看这里）</summary><pre>' + window.LiuNianData.PRINCIPLES + '</pre>';
    box.appendChild(det);

    // 大运排盘
    const du = el('div', 'card');
    let h = '<h3>大运排盘</h3>' +
      '<p class="muted">年干 ' + r.yearGan + '（' + (r.yangYear ? '阳' : '阴') + '年）· ' + (r.male ? '男命' : '女命') + ' → ' +
      r.jieText + '；出生到最近节气 ' + r.jieDays + ' 天，起运约 <b>' + r.startAge + ' 岁</b>。</p>' +
      '<table class="pillars"><thead><tr><th>运序</th><th>大运</th><th>起运岁</th><th>约公元</th></tr></thead><tbody>';
    r.dayuns.forEach(dy => {
      h += '<tr><td>第' + dy.index + '运</td><td class="big">' + dy.gz + '</td><td>' + dy.ageStart + '–' + dy.ageEnd + '岁</td><td>' + dy.yearStartApprox + '</td></tr>';
    });
    h += '</tbody></table>';
    du.innerHTML = h;
    box.appendChild(du);

    // 流年简表
    const ln = el('div', 'card');
    let hh = '<h3>流年简表（' + r.fromYear + ' 起 ' + r.years + ' 年）</h3>' +
      '<table class="pillars"><thead><tr><th>年份</th><th>年龄</th><th>流年</th><th>天干对日主</th><th>犯太岁/日支</th><th>当值大运</th></tr></thead><tbody>';
    r.liunians.forEach(x => {
      const flags = [];
      if (x.taiSui !== 'none') flags.push('<span class="bad">' + x.taiSui + '</span>');
      if (x.dayZhiRel !== 'none') flags.push('<span class="muted">日支' + x.dayZhiRel + '</span>');
      if (!flags.length) flags.push('<span class="muted">—</span>');
      hh += '<tr><td>' + x.year + '</td><td>' + x.age + '</td><td class="big">' + x.gz + '</td>' +
        '<td>' + x.ganAct + '</td><td>' + flags.join(' ') + '</td><td>' + x.dayun + '</td></tr>';
    });
    hh += '</tbody></table>';
    // 逐年说明
    hh += '<details><summary>逐年解读</summary><ul class="rel">';
    r.liunians.forEach(x => {
      hh += '<li><b>' + x.year + ' ' + x.gz + '</b>（' + x.age + '岁）：天干对日主为「' + x.ganAct + '」—' + x.ganActDesc +
        (x.taiSui !== 'none' ? '；<b class="bad">' + x.taiSuiDesc + '</b>' : '') +
        (x.dayZhiRel !== 'none' ? '；' + x.dayZhiDesc : '') + '</li>';
    });
    hh += '</ul></details>';
    ln.innerHTML = hh;
    box.appendChild(ln);

    box.appendChild(window.BaiHua.liunian(r));
    box.appendChild(el('p', 'disclaimer', '免责声明：本工具仅供娱乐与文化研究，所有结果不代表任何医疗、财务、法律或人生建议。请理性看待，切勿迷信。'));
  }
})();
