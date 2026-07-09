/*
 * ziwei.js — 紫微斗数 UI 面板（读取档案 #p-date/#p-hour/gender，调用 core 渲染命盘）
 */
(function () {
  'use strict';
  const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };

  window.PANELS = window.PANELS || {};
  window.PANELS['ziwei'] = function () {
    const wrap = el('div', 'form-wrap');
    wrap.appendChild(el('h2', null, '紫微斗数 · 命盘'));
    wrap.appendChild(el('p', 'muted', '信息取自上方「个人档案」。点击下方排盘；时辰不详时命宫按子时近似，结果仅供参考。'));

    const btn = el('button', 'primary', '排紫微命盘');
    btn.onclick = run;
    wrap.appendChild(btn);

    const report = el('div', 'report'); report.id = 'ziwei-report';
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
    const name = (document.getElementById('p-name').value || '').trim();

    const r = ZiWei.compute({ year: y, month: mo, day: d, hour, gender, name });
    render(r);
    const rep = document.getElementById('ziwei-report');
    if (rep && rep.scrollIntoView) rep.scrollIntoView({ behavior: 'smooth' });
  }

  function render(r) {
    const box = document.getElementById('ziwei-report');
    box.innerHTML = '';

    const det = el('details', 'card principle');
    det.open = true;
    det.innerHTML = '<summary>命理科普（先看这里）</summary><pre>' + window.ZiWeiData.PRINCIPLES + '</pre>';
    box.appendChild(det);

    const info = el('div', 'card');
    info.innerHTML = '<h3>基本信息</h3>' +
      row('公历', r.solarText) +
      row('农历', r.yearGZ + '年 ' + r.monthGZ + '月 ' + r.dayGZ + '日（农历' + r.dayNum + '日）') +
      row('命宫', r.mingGong.zhi + '宫') +
      row('身宫', r.shenGong.zhi + '宫（' + r.shenGong.name + '）') +
      row('五行局', (r.juName || '—') + '（命宫' + r.mingGZ + '，纳音' + r.nayin + '）') +
      row('紫微星', '在' + r.ziweiZhi + '宫（天府在' + r.tianfuZhi + '宫，对宫）') +
      (r.timeGZ ? '' : '<p class="warn">⚠ 时辰不详：命宫按子时近似，身宫/对宫等论断仅供参考。</p>');
    box.appendChild(info);

    const pt = el('div', 'card');
    let html = '<h3>十二宫命盘</h3><table class="ziwei"><thead><tr><th>宫名</th><th>地支</th><th>主星</th><th>四化</th></tr></thead><tbody>';
    r.gongs.forEach(g => {
      html += '<tr' + (g.name === '命宫' ? ' class="day-row"' : '') + '>' +
        '<td>' + g.name + '</td><td>' + g.zhi + '</td>' +
        '<td>' + (g.stars.length ? g.stars.join('、') : '<span class="muted">（空）</span>') + '</td>' +
        '<td>' + (g.hua.length ? g.hua.join('、') : '') + '</td></tr>';
    });
    html += '</tbody></table>';
    pt.innerHTML = html;
    box.appendChild(pt);

    const sh = el('div', 'card');
    const s = r.sihua;
    sh.innerHTML = '<h3>年干四化（' + r.yearGZ[0] + '年干 · 南派）</h3>' +
      '<p>化禄：<b>' + (s.禄 || '—') + '</b> ｜ 化权：<b>' + (s.权 || '—') + '</b> ｜ 化科：<b>' + (s.科 || '—') + '</b> ｜ 化忌：<b>' + (s.忌 || '—') + '</b></p>';
    box.appendChild(sh);

    if (window.SVGKit) box.insertAdjacentHTML('beforeend', window.SVGKit.ziweiChart(r.gongs, r.mingGong, r.shenGong));
    if (window.BaiHua && window.BaiHua.ziwei) box.appendChild(window.BaiHua.ziwei(r));

    box.appendChild(el('p', 'disclaimer', '免责声明：本工具仅供娱乐与文化研究，所有结果不代表任何医疗、财务、法律或人生建议。请理性看待，切勿迷信。'));
  }

  function row(k, v) { return '<div class="kv"><span class="k">' + k + '</span><span class="v">' + v + '</span></div>'; }
})();
