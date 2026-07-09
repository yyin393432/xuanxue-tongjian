/*
 * xingzuo.js — 星座 UI 面板（读取档案 #p-date 的月日，调用 core 渲染）
 */
(function () {
  'use strict';
  const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };

  window.PANELS = window.PANELS || {};
  window.PANELS['xingzuo'] = function () {
    const wrap = el('div', 'form-wrap');
    wrap.appendChild(el('h2', null, '星座 · 太阳星座'));
    wrap.appendChild(el('p', 'muted', '信息取自上方「个人档案」的公历出生日期（月/日）。点击下方测算。'));

    const btn = el('button', 'primary', '开始测算（星座）');
    btn.onclick = run;
    wrap.appendChild(btn);

    const report = el('div', 'report'); report.id = 'xingzuo-report';
    wrap.appendChild(report);
    return wrap;
  };

  function run() {
    const date = document.getElementById('p-date').value;
    if (!date) { alert('请在上方档案填写出生日期'); return; }
    const [, mo, d] = date.split('-').map(Number);
    const r = window.XingZuo.compute({ month: mo, day: d });
    render(r);
    const rep = document.getElementById('xingzuo-report');
    if (rep && rep.scrollIntoView) rep.scrollIntoView({ behavior: 'smooth' });
  }

  function render(r) {
    const box = document.getElementById('xingzuo-report');
    box.innerHTML = '';

    const det = el('details', 'card principle');
    det.open = true;
    det.innerHTML = '<summary>命理科普（先看这里）</summary><pre>' + window.XingZuoData.PRINCIPLES + '</pre>';
    box.appendChild(det);

    const info = el('div', 'card');
    info.innerHTML = '<h3>基本信息</h3>' +
      row('出生月日', r.month + ' 月 ' + r.day + ' 日') +
      row('太阳星座', r.name + '（' + r.en + '）');
    box.appendChild(info);

    const tr = el('div', 'card');
    tr.innerHTML = '<h3>性格特质</h3><p>' + r.traits + '</p>';
    box.appendChild(tr);

    const fo = el('div', 'card');
    fo.innerHTML = '<h3>年度运势（文化解读）</h3><p>' + r.fortune + '</p>' +
      '<p class="muted">年度运势为按星座气质的普适解读，绝不等于预言。</p>';
    box.appendChild(fo);

    box.appendChild(window.BaiHua.xingzuo(r));
    box.appendChild(el('p', 'disclaimer', '免责声明：本工具仅供娱乐与文化研究，所有结果不代表任何医疗、财务、法律或人生建议。请理性看待，切勿迷信。'));
  }

  function row(k, v) { return '<div class="kv"><span class="k">' + k + '</span><span class="v">' + v + '</span></div>'; }
})();
