/*
 * hemwei.js — 八字合婚 UI 面板（两人信息 → 综合合婚评分）
 */
(function () {
  'use strict';
  const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };

  window.PANELS = window.PANELS || {};
  window.PANELS['hemwei'] = function () {
    const wrap = el('div', 'form-wrap');
    wrap.appendChild(el('h2', null, '八字合婚'));
    wrap.appendChild(el('p', 'muted', '填写双方公历生日与性别（甲方可取自上方个人档案）。点击下方合婚，看生肖 / 日柱 / 五行 / 星座的综合契合度。'));

    // 甲方（预填档案）
    wrap.appendChild(el('h3', null, '甲方'));
    const f1 = personForm('a');
    wrap.appendChild(f1);
    // 乙方
    wrap.appendChild(el('h3', null, '乙方'));
    const f2 = personForm('b');
    wrap.appendChild(f2);

    const btn = el('button', 'primary', '开始合婚');
    btn.onclick = run;
    wrap.appendChild(btn);

    const report = el('div', 'report'); report.id = 'hemwei-report';
    wrap.appendChild(report);
    return wrap;
  };

  function personForm(tag) {
    const f = el('div', 'profile-form');
    const r1 = el('div', 'field');
    r1.innerHTML = '<label>公历生日' + (tag === 'a' ? '（可留空用档案）' : '') + '</label>';
    const dt = el('input'); dt.type = 'date'; dt.id = 'hw-' + tag + '-date';
    if (tag === 'a') { const pv = document.getElementById('p-date'); if (pv) dt.value = pv.value; }
    else dt.value = '1992-08-15';
    r1.appendChild(dt); f.appendChild(r1);

    const r2 = el('div', 'field');
    r2.innerHTML = '<label>性别</label>';
    const seg = el('div', 'seg');
    const m = tag === 'a' ? '男' : '女';
    seg.innerHTML = '<label class="seg-l"><input type="radio" name="hw-' + tag + '-g" value="男"' + (m === '男' ? ' checked' : '') + '> 男</label>' +
      '<label class="seg-l"><input type="radio" name="hw-' + tag + '-g" value="女"' + (m === '女' ? ' checked' : '') + '> 女</label>';
    r2.appendChild(seg); f.appendChild(r2);

    const r3 = el('div', 'field');
    r3.innerHTML = '<label>姓名（可选）</label>';
    const nm = el('input'); nm.type = 'text'; nm.id = 'hw-' + tag + '-name'; nm.placeholder = '选填';
    if (tag === 'a') { const pv = document.getElementById('p-name'); if (pv) nm.value = pv.value; }
    r3.appendChild(nm); f.appendChild(r3);
    return f;
  }

  function readPerson(tag) {
    const v = document.getElementById('hw-' + tag + '-date').value;
    if (!v) return null;
    const [y, m, d] = v.split('-').map(Number);
    const gender = (document.querySelector('input[name=hw-' + tag + '-g]:checked') || {}).value || '男';
    const name = (document.getElementById('hw-' + tag + '-name').value || '').trim();
    return { year: y, month: m, day: d, hour: 12, gender, name: name || null };
  }

  function run() {
    const p1 = readPerson('a') || readProfilePerson();
    const p2 = readPerson('b');
    if (!p1 || !p2) { alert('请填写双方生日'); return; }
    const r = window.HemWei.compute({ p1, p2 });
    render(r);
    const rep = document.getElementById('hemwei-report');
    if (rep && rep.scrollIntoView) rep.scrollIntoView({ behavior: 'smooth' });
  }

  function readProfilePerson() {
    const v = document.getElementById('p-date').value;
    if (!v) return null;
    const [y, m, d] = v.split('-').map(Number);
    const gender = (document.querySelector('input[name=gender]:checked') || {}).value || '男';
    return { year: y, month: m, day: d, hour: 12, gender, name: null };
  }

  function render(r) {
    const box = document.getElementById('hemwei-report');
    box.innerHTML = '';

    const det = el('details', 'card principle');
    det.open = true;
    det.innerHTML = '<summary>命理科普（先看这里）</summary><pre>' + window.HemWeiData.PRINCIPLES + '</pre>';
    box.appendChild(det);

    // 综合评分
    const sc = el('div', 'card');
    sc.innerHTML = '<h3>综合合婚评分</h3>' +
      '<p style="font-size:28px"><b>' + r.score + '</b> / 100　<span class="' + (r.score >= 60 ? 'good' : 'bad') + '">' + r.grade + '</span></p>' +
      '<p class="muted">评分 = 生肖 + 日干 + 日支 + 五行互补 + 十神互补 + 星座 加权汇总，仅供娱乐参考。</p>';
    box.appendChild(sc);

    // 双方八字概览
    const ov = el('div', 'card');
    ov.innerHTML = '<h3>双方八字概览</h3>' +
      personRow('甲方', r.p1) + personRow('乙方', r.p2);
    box.appendChild(ov);

    // 各维度要点
    const pt = el('div', 'card');
    let h = '<h3>合婚要点（分维度）</h3><ul class="rel">';
    r.parts.forEach(p => {
      const cls = p.score > 0 ? 'good' : (p.score < 0 ? 'bad' : 'mid');
      h += '<li><b>' + p.label + '</b> <span class="' + cls + '">（' + (p.score > 0 ? '+' : '') + p.score + '）</span><br>' +
        '<span class="muted">' + p.detail + '</span></li>';
    });
    h += '</ul>';
    pt.innerHTML = h;
    box.appendChild(pt);

    box.appendChild(window.BaiHua.hemwei(r));
    box.appendChild(el('p', 'disclaimer', '免责声明：本工具仅供娱乐与文化研究，所有结果不代表任何医疗、财务、法律或人生建议。请理性看待，切勿迷信。'));
  }

  function personRow(role, p) {
    const xz = p.xingzuo ? p.xingzuo.name : '—';
    return row(role, (p.name || '（无名）') + ' · ' + p.shengxiao + ' · 日柱 ' + p.dayGZ + ' · ' + xz);
  }

  function row(k, v) { return '<div class="kv"><span class="k">' + k + '</span><span class="v">' + v + '</span></div>'; }
})();
