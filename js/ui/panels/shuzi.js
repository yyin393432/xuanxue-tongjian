/*
 * shuzi.js — 数字能量 UI 面板（号码输入 → 八星解读）
 */
(function () {
  'use strict';
  const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };

  window.PANELS = window.PANELS || {};
  window.PANELS['shuzi'] = function () {
    const wrap = el('div', 'form-wrap');
    wrap.appendChild(el('h2', null, '数字能量 · 八星解读'));
    wrap.appendChild(el('p', 'muted', '输入手机号 / 车牌 / QQ 等数字串，按「八星数字能量」两两分组解读磁场吉凶。'));

    const f = el('div', 'profile-form');
    const r1 = el('div', 'field');
    r1.innerHTML = '<label>数字串（号码 / 车牌）</label>';
    const inp = el('input'); inp.type = 'text'; inp.id = 'shuzi-num'; inp.placeholder = '如：13812345678'; inp.value = '13812345678';
    r1.appendChild(inp); f.appendChild(r1);
    wrap.appendChild(f);

    const btn = el('button', 'primary', '开始解读（数字能量）');
    btn.onclick = run;
    wrap.appendChild(btn);

    const report = el('div', 'report'); report.id = 'shuzi-report';
    wrap.appendChild(report);
    return wrap;
  };

  function run() {
    const num = (document.getElementById('shuzi-num').value || '').trim();
    if (!num) { alert('请输入数字串'); return; }
    let r;
    try { r = window.ShuZi.compute({ number: num }); }
    catch (e) { alert(e.message); return; }
    render(r, num);
    const rep = document.getElementById('shuzi-report');
    if (rep && rep.scrollIntoView) rep.scrollIntoView({ behavior: 'smooth' });
  }

  function render(r, num) {
    const box = document.getElementById('shuzi-report');
    box.innerHTML = '';

    const det = el('details', 'card principle');
    det.open = true;
    det.innerHTML = '<summary>命理科普（先看这里）</summary><pre>' + window.ShuZiData.PRINCIPLES + '</pre>';
    box.appendChild(det);

    // 基本信息
    const info = el('div', 'card');
    info.innerHTML = '<h3>基本信息</h3>' +
      row('输入数字', num) +
      row('清洗后位数', r.length + ' 位') +
      row('尾号组', r.tailGroup ? (r.tailGroup.pair + '（' + r.tailGroup.star + '·' + r.tailGroup.level + '）') : '—');
    box.appendChild(info);

    // 分组逐解
    const grp = el('div', 'card');
    let h = '<h3>两两分组解读（从右往左，尾号组影响最大）</h3><ul class="rel">';
    r.groups.forEach(g => {
      const s = g.star;
      const lvCls = s.level === '吉' ? 'good' : (s.level === '凶' ? 'bad' : 'mid');
      h += '<li><b>' + g.pair + '</b> · <span class="' + lvCls + '">' + s.name + '（' + s.level + '）</span>' +
        ' <span class="muted">[' + g.pos + ']</span><br>' +
        '<span class="muted">' + s.desc + '</span><br>' +
        '<b>建议：</b>' + s.advice + '</li>';
    });
    h += '</ul>';
    grp.innerHTML = h;
    box.appendChild(grp);

    // 整体概览
    const ov = el('div', 'card');
    const c = r.count;
    ov.innerHTML = '<h3>整体概览</h3>' +
      '<p>吉星 <b class="good">' + c.ji + '</b> ｜ 凶星 <b class="bad">' + c.xiong + '</b> ｜ 平 <b class="mid">' + c.ping + '</b></p>' +
      '<p>' + r.overview + '</p>' +
      '<p class="muted">吉凶星释义：' + Object.keys(r.levelDesc).map(k => k + '—' + r.levelDesc[k]).join('；') + '</p>';
    box.appendChild(ov);

    box.appendChild(window.BaiHua.shuzi(r));
    box.appendChild(el('p', 'disclaimer', '免责声明：本工具仅供娱乐与文化研究，所有结果不代表任何医疗、财务、法律或人生建议。请理性看待，切勿迷信。'));
  }

  function row(k, v) { return '<div class="kv"><span class="k">' + k + '</span><span class="v">' + v + '</span></div>'; }
})();
