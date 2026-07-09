/*
 * liuyao.js — 六爻 UI 面板（摇卦 / 数字 / 时间 起卦，调用 core 装卦渲染）
 */
(function () {
  'use strict';
  const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };

  window.PANELS = window.PANELS || {};
  window.PANELS['liuyao'] = function () {
    const wrap = el('div', 'form-wrap');
    wrap.appendChild(el('h2', null, '六爻 · 纳甲筮法'));
    wrap.appendChild(el('p', 'muted', '可选起卦方式：摇卦（模拟三枚铜钱）、数字起卦、时间起卦。占卦日干取自档案日期（用于六神），未填则按当日。'));

    const row = el('div', 'btn-row');
    const b1 = el('button', 'primary', '🎲 摇卦起卦');
    const b2 = el('button', '', '数字起卦');
    const b3 = el('button', '', '时间起卦');
    row.appendChild(b1); row.appendChild(b2); row.appendChild(b3);
    wrap.appendChild(row);

    // 数字起卦输入
    const numBox = el('div', 'field'); numBox.style.marginTop = '8px';
    numBox.innerHTML = '<label>两个数字（各 1-999，留空随机）</label>';
    const n1 = el('input'); n1.type = 'number'; n1.placeholder = '数字一'; n1.id = 'ly-n1';
    const n2 = el('input'); n2.type = 'number'; n2.placeholder = '数字二'; n2.id = 'ly-n2';
    numBox.appendChild(n1); numBox.appendChild(n2);
    numBox.style.display = 'none';
    wrap.appendChild(numBox);
    b2.onclick = () => { numBox.style.display = numBox.style.display === 'none' ? 'block' : 'none'; };

    b1.onclick = () => { const c = LiuYao.castByYao(); doCast(c.yao, c.dong); };
    b2.onclick = () => {
      const a = parseInt(n1.value, 10), b = parseInt(n2.value, 10);
      let ya = (isNaN(a) ? Math.floor(Math.random() * 999) + 1 : a);
      let yb = (isNaN(b) ? Math.floor(Math.random() * 999) + 1 : b);
      const up = (ya % 8 === 0 ? 8 : ya % 8) - 1;
      const down = (yb % 8 === 0 ? 8 : yb % 8) - 1;
      const upper = ((ya + yb) % 6 === 0 ? 6 : (ya + yb) % 6);
      const yao = hexFromTrigrams(up, down);
      const dong = yao.map((_, i) => (i === upper - 1 ? 1 : 0));
      doCast(yao, dong);
    };
    b3.onclick = () => {
      const d = currentDate();
      const up = ((d.y + d.m + d.day) % 8 === 0 ? 8 : (d.y + d.m + d.day) % 8) - 1;
      const down = ((d.m + d.day + (d.hour || 0)) % 8 === 0 ? 8 : (d.m + d.day + (d.hour || 0)) % 8) - 1;
      const upper = (((d.y + d.m + d.day + (d.hour || 0)) % 6) === 0 ? 6 : (d.y + d.m + d.day + (d.hour || 0)) % 6);
      const yao = hexFromTrigrams(up, down);
      const dong = yao.map((_, i) => (i === upper - 1 ? 1 : 0));
      doCast(yao, dong);
    };

    const report = el('div', 'report'); report.id = 'liuyao-report';
    wrap.appendChild(report);
    return wrap;
  };

  function hexFromTrigrams(up, down) {
    // up/down: 八卦索引 0..7 -> 三爻
    const tri = (idx) => { const v = 7 - idx; return [v & 1, (v >> 1) & 1, (v >> 2) & 1]; };
    const d = tri(down), u = tri(up);
    return [d[0], d[1], d[2], u[0], u[1], u[2]];
  }
  function currentDate() {
    const date = document.getElementById('p-date').value;
    const hourSel = document.getElementById('p-hour').value;
    let hour = null;
    if (hourSel !== 'unknown') hour = parseInt(hourSel.replace('est:', ''), 10);
    let y = 2000, m = 1, day = 1;
    if (date) { const p = date.split('-').map(Number); y = p[0]; m = p[1]; day = p[2]; }
    return { y, m, day, hour };
  }
  function dayGanOf() {
    const d = currentDate();
    const solar = window.Solar.fromYmdHms(d.y, d.m, d.day, (d.hour != null ? d.hour : 0), 0, 0);
    return solar.getLunar().getDayInGanZhiExact()[0];
  }

  function doCast(yao, dong) {
    const dg = dayGanOf();
    const r = LiuYao.compute({ yao, dong, dayGan: dg });
    render(r);
    const rep = document.getElementById('liuyao-report');
    if (rep && rep.scrollIntoView) rep.scrollIntoView({ behavior: 'smooth' });
  }

  function render(r) {
    const box = document.getElementById('liuyao-report');
    box.innerHTML = '';

    const det = el('details', 'card principle');
    det.open = true;
    det.innerHTML = '<summary>命理科普（先看这里）</summary><pre>' + window.LiuYaoData.PRINCIPLES + '</pre>';
    box.appendChild(det);

    const g = el('div', 'card');
    g.innerHTML = '<h3>本卦 · ' + r.ben.name + '</h3>' +
      '<pre class="hex">' + r.ben.lines + '</pre>' +
      '<p class="muted">上卦 ' + r.ben.up + ' ｜ 下卦 ' + r.ben.down + ' ｜ 卦宫 ' + r.ben.gong + '（' + r.ben.gongWx + '）｜ 世爻 ' + r.ben.shi + ' ｜ 应爻 ' + r.ben.ying + '</p>';
    box.appendChild(g);

    if (r.dongCount > 0) {
      const b = el('div', 'card');
      b.innerHTML = '<h3>变卦 · ' + r.bian.name + '</h3>' +
        '<pre class="hex">' + r.bian.lines + '</pre>' +
        '<p class="muted">上卦 ' + r.bian.up + ' ｜ 下卦 ' + r.bian.down + '</p>';
      box.appendChild(b);
    }

    const t = el('div', 'card');
    let html = '<h3>装卦明细（占卦日干 ' + r.dayGan + '）</h3>';
    html += '<table class="liuyao"><thead><tr><th>爻位</th><th>爻象</th><th>干支</th><th>五行</th><th>六亲</th><th>六神</th><th>世应</th></tr></thead><tbody>';
    r.detail.forEach(l => {
      const sym = l.yang ? (l.dong ? '○' : '—') : (l.dong ? '×' : '–');
      const sy = l.yao === r.ben.shi ? '世' : (l.yao === r.ben.ying ? '应' : '');
      html += '<tr' + (l.dong ? ' class="dong"' : '') + '>' +
        '<td>' + l.yaoName + (l.dong ? '（动）' : '') + '</td>' +
        '<td>' + sym + '</td>' +
        '<td>' + l.ganZhi + '</td>' +
        '<td>' + l.wuxing + '</td>' +
        '<td>' + l.qin + '</td>' +
        '<td>' + l.shen + '</td>' +
        '<td>' + sy + '</td></tr>';
    });
    html += '</tbody></table>';
    t.innerHTML = html;
    box.appendChild(t);

    const d = el('div', 'card');
    d.innerHTML = '<h3>简断</h3><p>' + r.duan + '</p>' +
      '<p class="muted">提示：问财看妻财、问功名看官鬼、问学业看父母、问子孙看子孙，结合世应兴衰与动爻生克细推。本版为简化装卦，仅供文化研究与娱乐参考。</p>';
    box.appendChild(d);

    box.appendChild(window.BaiHua.liuyao(r));
    box.appendChild(el('p', 'disclaimer', '免责声明：本工具仅供娱乐与文化研究，所有结果不代表任何医疗、财务、法律或人生建议。请理性看待，切勿迷信。'));
  }
})();
