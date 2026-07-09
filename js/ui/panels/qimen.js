/*
 * qimen.js — 奇门遁甲 UI 面板（读取档案日期时辰，调用 core 渲染九宫盘）
 */
(function () {
  'use strict';
  const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };

  window.PANELS = window.PANELS || {};
  window.PANELS['qimen'] = function () {
    const wrap = el('div', 'form-wrap');
    wrap.appendChild(el('h2', null, '奇门遁甲 · 排盘'));
    wrap.appendChild(el('p', 'muted', '信息取自上方「个人档案」（公历日期 + 时辰）。点击下方排盘，得九宫三盘。'));

    const btn = el('button', 'primary', '排奇门盘');
    btn.onclick = run;
    wrap.appendChild(btn);

    const report = el('div', 'report'); report.id = 'qimen-report';
    wrap.appendChild(report);
    return wrap;
  };

  function run() {
    const date = document.getElementById('p-date').value;
    if (!date) { alert('请在上方档案填写出生日期'); return; }
    const [y, mo, d] = date.split('-').map(Number);
    const hourSel = document.getElementById('p-hour').value;
    let hour = 0;
    if (hourSel !== 'unknown') hour = parseInt(hourSel.replace('est:', ''), 10);

    const r = QiMen.compute({ year: y, month: mo, day: d, hour });
    render(r);
    const rep = document.getElementById('qimen-report');
    if (rep && rep.scrollIntoView) rep.scrollIntoView({ behavior: 'smooth' });
  }

  function render(r) {
    const box = document.getElementById('qimen-report');
    box.innerHTML = '';

    const det = el('details', 'card principle');
    det.open = true;
    det.innerHTML = '<summary>命理科普（先看这里）</summary><pre>' + window.QiMenData.PRINCIPLES + '</pre>';
    box.appendChild(det);

    const info = el('div', 'card');
    info.innerHTML = '<h3>定局信息</h3>' +
      row('公历', r.solarText) +
      row('节气', r.jieqi + '（' + r.yinText + '）') +
      row('三元 / 局数', r.yuan + '元 · ' + r.yinText + ' ' + r.ju + ' 局') +
      row('日干支', r.dayGZ) +
      row('时干支', r.timeGZ + '（时干 ' + r.timeGan + ' 落 ' + r.shiGanGong + '宫）') +
      row('值符', r.valueStar + ' ｜ 值使：' + r.zhiShiMen);
    box.appendChild(info);

    const grid = el('div', 'card');
    let g = '<h3>九宫盘（洛书布局）</h3><div class="qimen-grid">';
    // GRID: 宫 -> [row,col]
    const placed = {};
    r.cells.forEach(c => { placed[c.gong] = c; });
    for (let rowI = 0; rowI < 3; rowI++) {
      for (let colI = 0; colI < 3; colI++) {
        const cell = Object.values(placed).find(c => r.GRID[c.gong][0] === rowI && r.GRID[c.gong][1] === colI);
        if (!cell) { g += '<div class="qc empty"></div>'; continue; }
        const flag = (cell.isValueStar ? ' ⭐值符' : '') + (cell.isZhiShi ? ' ⚑值使' : '');
        g += '<div class="qc">' +
          '<div class="qc-gong">' + cell.gong + '宫·' + cell.name + '·' + cell.dir + '</div>' +
          '<div class="qc-di">地：' + cell.di + '</div>' +
          '<div class="qc-tian">星：' + cell.tian + (cell.isValueStar ? '⭐' : '') + '</div>' +
          '<div class="qc-men">门：' + cell.men + (cell.isZhiShi ? '⚑' : '') + '</div>' +
          '<div class="qc-shen">神：' + (cell.shen || '—') + '</div>' +
          '</div>';
      }
    }
    g += '</div>';
    grid.innerHTML = g;
    box.appendChild(grid);

    if (window.SVGKit) box.insertAdjacentHTML('beforeend', window.SVGKit.qimenGrid(r.cells, r.ju, r.yinText));
    box.appendChild(window.BaiHua.qimen(r));
    box.appendChild(el('p', 'disclaimer', '免责声明：本工具仅供娱乐与文化研究，所有结果不代表任何医疗、财务、法律或人生建议。请理性看待，切勿迷信。本盘为简化排盘（拆补法思路、三元按日干、中宫寄坤、八神不入中宫），深入占断请研习专业典籍。'));
  }

  function row(k, v) { return '<div class="kv"><span class="k">' + k + '</span><span class="v">' + v + '</span></div>'; }
})();
