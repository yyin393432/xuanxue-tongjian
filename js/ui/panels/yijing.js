/*
 * yijing.js — 易经/梅花易数 UI 面板（金钱卦 / 数字卦 / 时间卦，调用 core 渲染本卦变卦）
 */
(function () {
  'use strict';
  const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };

  window.PANELS = window.PANELS || {};
  window.PANELS['yijing'] = function () {
    const wrap = el('div', 'form-wrap');
    wrap.appendChild(el('h2', null, '易经 · 起卦占断（含梅花易数）'));
    wrap.appendChild(el('p', 'muted', '选起卦方式：金钱卦（三枚铜钱）、数字卦、时间卦（梅花易数）。下方输入可选，留空随机。'));

    const row = el('div', 'btn-row');
    const b1 = el('button', 'primary', '🪙 金钱卦');
    const b2 = el('button', '', '数字卦');
    const b3 = el('button', '', '时间卦（梅花）');
    row.appendChild(b1); row.appendChild(b2); row.appendChild(b3);
    wrap.appendChild(row);

    const numBox = el('div', 'field'); numBox.style.marginTop = '8px';
    numBox.innerHTML = '<label>两个数字（1-999，留空随机）</label>';
    const n1 = el('input'); n1.type = 'number'; n1.placeholder = '数字一'; n1.id = 'yj-n1';
    const n2 = el('input'); n2.type = 'number'; n2.placeholder = '数字二'; n2.id = 'yj-n2';
    numBox.appendChild(n1); numBox.appendChild(n2);
    numBox.style.display = 'none';
    wrap.appendChild(numBox);
    b2.onclick = () => { numBox.style.display = numBox.style.display === 'none' ? 'block' : 'none'; };

    b1.onclick = () => {
      const yao = [], dong = [];
      for (let i = 0; i < 6; i++) { const r = coin(); yao.push(r.v); dong.push(r.d); }
      doCast(yao, dong);
    };
    b2.onclick = () => {
      const a = parseInt(n1.value, 10), b = parseInt(n2.value, 10);
      const ya = isNaN(a) ? Math.floor(Math.random() * 999) + 1 : a;
      const yb = isNaN(b) ? Math.floor(Math.random() * 999) + 1 : b;
      const up = ((ya % 8) || 8) - 1, down = ((yb % 8) || 8) - 1;
      const dongN = ((ya + yb) % 6) || 6;
      const c = YiJing.fromUpDown(up, down, dongN);
      doCast(c.yao, c.dong);
    };
    b3.onclick = () => {
      const d = cur();
      const up = ((d.y + d.m + d.day) % 8) || 8, down = ((d.m + d.day + (d.hour || 0)) % 8) || 8;
      const dongN = ((d.y + d.m + d.day + (d.hour || 0)) % 6) || 6;
      const c = YiJing.fromUpDown(up - 1, down - 1, dongN);
      doCast(c.yao, c.dong);
    };

    const report = el('div', 'report'); report.id = 'yijing-report';
    wrap.appendChild(report);
    return wrap;
  };

  function coin() {
    let heads = 0;
    for (let i = 0; i < 3; i++) heads += Math.random() < 0.5 ? 1 : 0;
    if (heads === 3) return { v: 1, d: 1 };   // 老阳
    if (heads === 0) return { v: 0, d: 1 };   // 老阴
    return { v: heads >= 2 ? 1 : 0, d: 0 };    // 少阳/少阴
  }
  function cur() {
    const date = document.getElementById('p-date').value;
    const hourSel = document.getElementById('p-hour').value;
    let hour = 0;
    if (hourSel !== 'unknown') hour = parseInt(hourSel.replace('est:', ''), 10);
    let y = 2000, m = 1, day = 1;
    if (date) { const p = date.split('-').map(Number); y = p[0]; m = p[1]; day = p[2]; }
    return { y, m, day, hour };
  }

  function doCast(yao, dong) {
    const r = YiJing.compute({ yao, dong });
    render(r);
    const rep = document.getElementById('yijing-report');
    if (rep && rep.scrollIntoView) rep.scrollIntoView({ behavior: 'smooth' });
  }

  function hexLines(yao) {
    const sym = yao.map(v => v ? '━━━' : '━ ━');
    return sym[5] + '\n' + sym[4] + '\n' + sym[3] + '\n――――\n' + sym[2] + '\n' + sym[1] + '\n' + sym[0];
  }

  function render(r) {
    const box = document.getElementById('yijing-report');
    box.innerHTML = '';

    const det = el('details', 'card principle');
    det.open = true;
    det.innerHTML = '<summary>命理科普（先看这里）</summary><pre>' + window.YiJingData.PRINCIPLES + '</pre>';
    box.appendChild(det);

    if (!r.ben) { box.appendChild(el('p', 'warn', '未找到对应卦象，请重试。')); return; }

    const g = el('div', 'card');
    g.innerHTML = '<h3>本卦 · ' + r.ben.name + '（' + r.ben.up + r.ben.down + '）</h3>' +
      '<pre class="hex">' + hexLines(r.lines.map(l => l.yang)) + '</pre>' +
      '<p><b>卦辞：</b>' + r.ben.gua + '</p>' +
      '<p class="muted">上卦 ' + r.ben.up + ' ｜ 下卦 ' + r.ben.down + '</p>';
    box.appendChild(g);

    const t = el('div', 'card');
    let html = '<h3>爻辞' + (r.dongPositions.length ? '（动爻已标 ○/×）' : '') + '</h3><ol class="yao">';
    r.lines.forEach(l => {
      let name;
      if (l.yang) name = l.yao === 1 ? '初九' : (l.yao === 6 ? '上九' : '九' + l.yao);
      else name = l.yao === 1 ? '初六' : (l.yao === 6 ? '上六' : l.yao + '六');
      html += '<li' + (l.dong ? ' class="dong"' : '') + '>' + name + '：' + l.txt + (l.dong ? ' ○动' : '') + '</li>';
    });
    html += '</ol>';
    if (r.yongJiu) html += '<p><b>用九：</b>见群龙无首，吉。</p>';
    if (r.yongLiu) html += '<p><b>用六：</b>利永贞。</p>';
    t.innerHTML = html;
    box.appendChild(t);

    if (r.bian && r.dongPositions.length) {
      const b = el('div', 'card');
      const by = r.lines.map(l => (l.dong ? (l.yang ? 0 : 1) : l.yang));
      b.innerHTML = '<h3>变卦 · ' + r.bian.name + '（' + r.bian.up + r.bian.down + '）</h3>' +
        '<pre class="hex">' + hexLines(by) + '</pre>' +
        '<p><b>卦辞：</b>' + r.bian.gua + '</p>';
      box.appendChild(b);
    }

    if (r.dongPositions.length) {
      const d = el('div', 'card');
      let html = '<h3>动爻断语</h3><ul>';
      r.dongYaoCi.forEach(o => {
        const ly = r.lines[o.yao - 1];
        const nm = ly && ly.yang ? (o.yao === 1 ? '初九' : (o.yao === 6 ? '上九' : '九' + o.yao)) : (o.yao === 1 ? '初六' : (o.yao === 6 ? '上六' : o.yao + '六'));
        html += '<li><b>' + nm + '</b>：' + o.ci + '</li>';
      });
      html += '</ul><p class="muted">梅花易数/纳甲均视动爻爻辞为断卦关键；体用生克、上下卦旺衰可进一步参详。本版仅供文化研究与娱乐参考。</p>';
      d.innerHTML = html;
      box.appendChild(d);
    } else {
      box.appendChild(el('p', 'warn', '本卦无动爻（静卦），以卦辞与全卦意象参看。'));
    }

    box.appendChild(window.BaiHua.yijing(r));
    box.appendChild(el('p', 'disclaimer', '免责声明：本工具仅供娱乐与文化研究，所有结果不代表任何医疗、财务、法律或人生建议。请理性看待，切勿迷信。'));
  }
})();
