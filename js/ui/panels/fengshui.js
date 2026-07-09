/*
 * fengshui.js — 风水 / 择日 UI 面板（选日期看黄历、八卦方位、简易择日）
 */
(function () {
  'use strict';
  const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };

  window.PANELS = window.PANELS || {};
  window.PANELS['fengshui'] = function () {
    const wrap = el('div', 'form-wrap');
    wrap.appendChild(el('h2', null, '风水 · 择日'));
    wrap.appendChild(el('p', 'muted', '选公历日期查看当日黄历；或选择事项，从所选日期起扫描近期吉日。八卦方位为民俗参考。'));

    const f = el('div', 'profile-form');
    const r1 = el('div', 'field');
    r1.innerHTML = '<label>查询公历日期</label>';
    const dt = el('input'); dt.type = 'date'; dt.id = 'fs-date'; dt.value = new Date().toISOString().slice(0, 10);
    r1.appendChild(dt); f.appendChild(r1);

    const r2 = el('div', 'field');
    r2.innerHTML = '<label>简易择日事项</label>';
    const sel = el('select'); sel.id = 'fs-matter';
    window.FengShui.MATTERS.forEach(m => sel.appendChild(new Option(m.name, m.key)));
    r2.appendChild(sel); f.appendChild(r2);
    wrap.appendChild(f);

    const btnRow = el('div', 'btn-row');
    const b1 = el('button', 'primary', '查当日黄历'); b1.onclick = runDay;
    const b2 = el('button', 'primary', '查近期吉日（从所选日期起）'); b2.onclick = runSelect;
    btnRow.appendChild(b1); btnRow.appendChild(b2);
    wrap.appendChild(btnRow);

    const report = el('div', 'report'); report.id = 'fs-report';
    wrap.appendChild(report);

    // 八卦方位（始终展示，民俗参考）
    wrap.appendChild(renderBagua());

    return wrap;
  };

  function renderBagua() {
    const box = el('details', 'card principle');
    box.innerHTML = '<summary>八卦方位吉凶（民俗参考）</summary><ul class="rel">' +
      window.FengShui.baguaDirections().map(b =>
        '<li><b>' + b.gua + '（' + b.dir + '·' + b.el + '）</b>：' + b.desc + '</li>').join('') +
      '</ul><p class="muted">※ 风水方位说法为传统民俗，仅供文化了解，不代表科学结论。</p>';
    return box;
  }

  function runDay() {
    const v = document.getElementById('fs-date').value;
    if (!v) { alert('请选择日期'); return; }
    const [y, m, d] = v.split('-').map(Number);
    const r = window.FengShui.computeDay({ year: y, month: m, day: d });
    renderDay(r);
    const rep = document.getElementById('fs-report');
    if (rep && rep.scrollIntoView) rep.scrollIntoView({ behavior: 'smooth' });
  }

  function runSelect() {
    const v = document.getElementById('fs-date').value;
    if (!v) { alert('请选择起始日期'); return; }
    const [y, m, d] = v.split('-').map(Number);
    const matter = document.getElementById('fs-matter').value;
    const r = window.FengShui.selectAuspicious({ matter: matter, fromYear: y, fromMonth: m, fromDay: d, days: 120 });
    renderSelect(r);
    const rep = document.getElementById('fs-report');
    if (rep && rep.scrollIntoView) rep.scrollIntoView({ behavior: 'smooth' });
  }

  function renderDay(r) {
    const box = document.getElementById('fs-report');
    box.innerHTML = '';

    const det = el('details', 'card principle');
    det.open = true;
    det.innerHTML = '<summary>命理科普（先看这里）</summary><pre>' + window.FengShuiData.PRINCIPLES + '</pre>';
    box.appendChild(det);

    const info = el('div', 'card');
    info.innerHTML = '<h3>当日黄历 · ' + r.solarText + '</h3>' +
      row('农历', r.lunarText) +
      row('干支', r.yearGZ + '年 ' + r.monthGZ + '月 ' + r.dayGZ + '日（纳音 ' + r.nayin + '）') +
      row('十二建除', r.zhiXing + '（' + r.zhiXingInfo.tend + '）· ' + r.zhiXingInfo.desc) +
      row('黄道黑道', r.tianShen + '（' + (r.isHuangDao ? '黄道·吉' : '黑道·凶') + '）· ' + r.tianShenDesc) +
      row('冲煞', '冲' + r.chong + '（' + r.chongShengXiao + '），煞' + r.sha) +
      row('彭祖百忌', r.pengZu);
    box.appendChild(info);

    const yj = el('div', 'card');
    yj.innerHTML = '<h3>宜 / 忌</h3>' +
      '<p class="good"><b>宜：</b>' + (r.yi.length ? r.yi.join('、') : '（无）') + '</p>' +
      '<p class="bad"><b>忌：</b>' + (r.ji.length ? r.ji.join('、') : '（无）') + '</p>' +
      '<p class="good"><b>吉神：</b>' + (r.jiShen.length ? r.jiShen.join('、') : '（无）') + '</p>' +
      '<p class="bad"><b>凶煞：</b>' + (r.xiongSha.length ? r.xiongSha.join('、') : '（无）') + '</p>';
    box.appendChild(yj);

    box.appendChild(window.BaiHua.fengshuiDay(r));
    box.appendChild(el('p', 'disclaimer', '免责声明：本工具仅供娱乐与文化研究，所有结果不代表任何医疗、财务、法律或人生建议。请理性看待，切勿迷信。'));
  }

  function renderSelect(r) {
    const box = document.getElementById('fs-report');
    // 在科普之后插入择日结果（保留已有黄历）
    const det = el('details', 'card principle');
    det.open = true;
    det.innerHTML = '<summary>命理科普（先看这里）</summary><pre>' + window.FengShuiData.PRINCIPLES + '</pre>';
    box.appendChild(det);

    const c = el('div', 'card');
    let h = '<h3>近期「' + r.matter + '」吉日（从所选日期起 120 天内，按评分排序）</h3>';
    if (!r.list.length) h += '<p>未筛选出合适日期，可放宽事项或更换起始日期。</p>';
    else {
      h += '<table class="pillars"><thead><tr><th>日期</th><th>干支</th><th>建除</th><th>黄道</th><th>冲</th></tr></thead><tbody>';
      r.list.forEach(x => {
        h += '<tr><td>' + x.date + '</td><td>' + x.dayGZ + '</td><td>' + x.zhiXing + '（' + x.zhiXingTend + '）</td>' +
          '<td>' + (x.isHuangDao ? '<span class="good">黄道</span>' : '<span class="bad">黑道</span>') + '</td>' +
          '<td>冲' + x.chongShengXiao + '</td></tr>';
      });
      h += '</tbody></table><p class="muted">筛选规则：宜含该事项、避开「破」日、优先黄道与吉建除。民俗参考，重大决策请结合多方。</p>';
    }
    c.innerHTML = h;
    box.appendChild(c);

    box.appendChild(window.BaiHua.fengshuiSelect(r));
    box.appendChild(el('p', 'disclaimer', '免责声明：本工具仅供娱乐与文化研究，所有结果不代表任何医疗、财务、法律或人生建议。请理性看待，切勿迷信。'));
  }

  function row(k, v) { return '<div class="kv"><span class="k">' + k + '</span><span class="v">' + v + '</span></div>'; }
})();
