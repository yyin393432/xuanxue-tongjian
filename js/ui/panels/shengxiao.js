/*
 * shengxiao.js — 生肖 UI 面板（读取档案 #p-date，复用 BaZi 取年支/生肖，调用 core 渲染）
 */
(function () {
  'use strict';
  const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };

  window.PANELS = window.PANELS || {};
  window.PANELS['shengxiao'] = function () {
    const wrap = el('div', 'form-wrap');
    wrap.appendChild(el('h2', null, '生肖 · 属相关系'));
    wrap.appendChild(el('p', 'muted', '信息取自上方「个人档案」的出生日期。点击下方测算；生肖以八字「立春」分界（非春节）。'));

    const btn = el('button', 'primary', '开始测算（生肖）');
    btn.onclick = run;
    wrap.appendChild(btn);

    const report = el('div', 'report'); report.id = 'shengxiao-report';
    wrap.appendChild(report);
    return wrap;
  };

  function run() {
    const date = document.getElementById('p-date').value;
    if (!date) { alert('请在上方档案填写出生日期'); return; }
    const [y, mo, d] = date.split('-').map(Number);

    let yearGZ, shengxiao;
    if (window.BaZi) {
      const r = window.BaZi.compute({ year: y, month: mo, day: d, hour: null, gender: '男' });
      yearGZ = r.pillars.yearGZ; shengxiao = r.shengxiao;
    } else {
      const z = window.ShengXiao.yearZhiFromYear(y);
      yearGZ = [null, z]; shengxiao = window.WuXing.ZHI_SHENGXIAO[z];
    }
    const r = window.ShengXiao.compute({ yearZhi: yearGZ[1], shengxiao, refYear: y });
    render(r);
    const rep = document.getElementById('shengxiao-report');
    if (rep && rep.scrollIntoView) rep.scrollIntoView({ behavior: 'smooth' });
  }

  function render(r) {
    const box = document.getElementById('shengxiao-report');
    box.innerHTML = '';

    const det = el('details', 'card principle');
    det.open = true;
    det.innerHTML = '<summary>命理科普（先看这里）</summary><pre>' + window.ShengXiaoData.PRINCIPLES + '</pre>';
    box.appendChild(det);

    const info = el('div', 'card');
    info.innerHTML = '<h3>基本信息</h3>' +
      row('生肖', r.shengxiao + '（' + r.yearZhi + '）') +
      row('年支', r.yearZhi) +
      '<p class="muted">生肖按八字「立春」分界；若生日在立春前，生肖属上一年。</p>';
    box.appendChild(info);

    function relCard(title, list, note) {
      const c = el('div', 'card');
      let h = '<h3>' + title + '</h3><p>' + (note || '') + '</p><ul class="rel">';
      if (!list.length) h += '<li class="muted">无</li>';
      list.forEach(x => { h += '<li>' + x.zhi + ' · <b>' + x.shengxiao + '</b></li>'; });
      h += '</ul>';
      c.innerHTML = h;
      return c;
    }

    box.appendChild(relCard('三合（贵人）', r.sanHe, r.relationText.sanhe));
    box.appendChild(relCard('六合（天作之合）', r.liuHe, r.relationText.liuhe));
    box.appendChild(relCard('六冲（冲太岁）', r.liuChong, r.relationText.chong));
    box.appendChild(relCard('六害（害太岁）', r.liuHai, r.relationText.hai));
    box.appendChild(relCard('三刑（刑太岁）', r.sanXing, r.relationText.xing));
    box.appendChild(relCard('六破（破太岁）', r.liuPo, r.relationText.po));

    // 本命年
    if (r.benmingYears.length) {
      const c = el('div', 'card');
      c.innerHTML = '<h3>未来本命年（值太岁）</h3><p class="muted">' + r.relationText.benming + '</p>' +
        '<p>' + r.benmingYears.map(y => '<span class="tag">' + y + '</span>').join(' ') + '</p>';
      box.appendChild(c);
    }

    // 犯太岁年份
    if (r.taiSuiYears.length) {
      const c = el('div', 'card');
      let h = '<h3>未来犯太岁年份</h3><ul class="rel">';
      r.taiSuiYears.forEach(t => { h += '<li><b>' + t.year + '</b> 年：' + t.type + '（太岁生肖 ' + window.ShengXiaoData.SHENGXIAO[t.zhi] + '）</li>'; });
      h += '</ul>';
      c.innerHTML = h;
      box.appendChild(c);
    }

    box.appendChild(window.BaiHua.shengxiao(r));
    box.appendChild(el('p', 'disclaimer', '免责声明：本工具仅供娱乐与文化研究，所有结果不代表任何医疗、财务、法律或人生建议。请理性看待，切勿迷信。'));
  }

  function row(k, v) { return '<div class="kv"><span class="k">' + k + '</span><span class="v">' + v + '</span></div>'; }
})();
