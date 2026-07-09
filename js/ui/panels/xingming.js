/*
 * xingming.js — 姓名 UI 面板（自带姓名输入，可选结合八字喜用神，调用 core 渲染）
 */
(function () {
  'use strict';
  const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };

  window.PANELS = window.PANELS || {};
  window.PANELS['xingming'] = function () {
    const wrap = el('div', 'form-wrap');
    wrap.appendChild(el('h2', null, '姓名 · 五格剖象'));
    wrap.appendChild(el('p', 'muted', '输入姓名（汉字）。笔画以「简体通用笔画」为准；生僻字未收录会提示，绝不臆造。'));

    const f = el('div', 'field');
    f.innerHTML = '<label>姓名</label>';
    const inp = el('input'); inp.type = 'text'; inp.id = 'xm-name';
    inp.placeholder = '如：张三 / 欧阳娜娜';
    const pn = document.getElementById('p-name');
    if (pn && pn.value) inp.value = pn.value;
    f.appendChild(inp); wrap.appendChild(f);

    const btn = el('button', 'primary', '开始测算（姓名）');
    btn.onclick = run;
    wrap.appendChild(btn);

    const report = el('div', 'report'); report.id = 'xingming-report';
    wrap.appendChild(report);
    return wrap;
  };

  function run() {
    const inp = document.getElementById('xm-name');
    const name = (inp.value || '').trim();
    if (!name) { alert('请输入姓名'); return; }

    // 可选：结合档案生日推算八字日主五行作为喜用神参考
    let xi = null;
    const date = document.getElementById('p-date');
    if (date && date.value && window.BaZi) {
      try {
        const [y, mo, d] = date.value.split('-').map(Number);
        const br = window.BaZi.compute({ year: y, month: mo, day: d, hour: null, gender: '男' });
        if (br.dayW) xi = br.dayW;
      } catch (e) { /* 忽略，喜用神为可选项 */ }
    }

    const r = window.XingMing.compute({ name, xiYongShen: xi });
    render(r);
    const rep = document.getElementById('xingming-report');
    if (rep && rep.scrollIntoView) rep.scrollIntoView({ behavior: 'smooth' });
  }

  function gridRow(label, g) {
    if (!g) return '<tr><td>' + label + '</td><td colspan="3" class="muted">笔画缺失，无法计算</td></tr>';
    const jiCls = g.ji === '吉' ? 'ok' : (g.ji === '凶' ? 'bad' : 'mid');
    return '<tr><td>' + label + '</td><td class="big">' + g.value + '</td><td>' + g.wuxing +
      '</td><td><span class="ji ' + jiCls + '">' + g.ji + '</span></td></tr>' +
      '<tr class="sub-row"><td></td><td colspan="3" class="muted">' + g.desc + '</td></tr>';
  }

  function render(r) {
    const box = document.getElementById('xingming-report');
    box.innerHTML = '';

    const det = el('details', 'card principle');
    det.open = true;
    det.innerHTML = '<summary>命理科普（先看这里）</summary><pre>' + window.XingMingData.PRINCIPLES + '</pre>';
    box.appendChild(det);

    const info = el('div', 'card');
    let h = '<h3>基本信息</h3>' +
      row('姓名', r.name) +
      row('姓氏', r.surname + (r.isCompound ? '（复姓）' : '（单姓）')) +
      row('名字', r.given);
    if (r.missing.length) h += '<p class="warn">⚠ 以下字未收录笔画表，相关五格无法计算：' + r.missing.join('、') + '。如需精确结果，请提供该字笔画或改用康熙笔画表。</p>';
    info.innerHTML = h;
    box.appendChild(info);

    if (r.hasAll) {
      const g = el('div', 'card');
      g.innerHTML = '<h3>五格数理</h3><table class="pillars"><thead><tr><th>格</th><th>数理</th><th>五行</th><th>吉凶</th></tr></thead><tbody>' +
        gridRow('天格', r.grids.tian) +
        gridRow('人格', r.grids.ren) +
        gridRow('地格', r.grids.di) +
        gridRow('外格', r.grids.wai) +
        gridRow('总格', r.grids.zong) +
        '</tbody></table>';
      box.appendChild(g);

      if (r.sancai) {
        const s = el('div', 'card');
        const vCls = r.sancai.verdict === '大吉' || r.sancai.verdict === '吉' ? 'ok' : (r.sancai.verdict === '凶' ? 'bad' : 'mid');
        s.innerHTML = '<h3>三才配置（天/人/地格五行）</h3>' +
          row('五行', '天 ' + r.sancai.tian + ' ｜ 人 ' + r.sancai.ren + ' ｜ 地 ' + r.sancai.di) +
          '<p>判定：<span class="ji ' + vCls + '">' + r.sancai.verdict + '</span></p>' +
          '<p class="muted">' + r.sancai.reason + '</p>'
          + (r.xiNote ? '<p>' + r.xiNote + '</p>' : '');
        box.appendChild(s);
      }
    } else {
      box.appendChild(el('p', 'warn', '因存在未收录汉字，五格与三才暂未计算。请见上方提示。'));
    }

    box.appendChild(window.BaiHua.xingming(r));
    box.appendChild(el('p', 'disclaimer', '免责声明：本工具仅供娱乐与文化研究，所有结果不代表任何医疗、财务、法律或人生建议。请理性看待，切勿迷信。'));
  }

  function row(k, v) { return '<div class="kv"><span class="k">' + k + '</span><span class="v">' + v + '</span></div>'; }
})();
