/*
 * taiyi.js — 太乙/大六壬/铁板 UI 面板（科普 + 简化示意）
 */
(function () {
  'use strict';
  const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };

  window.PANELS = window.PANELS || {};
  window.PANELS['taiyi'] = function () {
    const wrap = el('div', 'form-wrap');
    wrap.appendChild(el('h2', null, '太乙神数 · 大六壬 · 铁板神数'));
    wrap.appendChild(el('p', 'muted', '三式及支流原理科普 + 形状级简化示意。排盘算法极繁，本版仅展示"盘面长什么样"，并非完整排盘，切勿用于实际占断。'));

    // 科普
    const det = el('details', 'card principle');
    det.open = true;
    det.innerHTML = '<summary>命理科普（先看这里）</summary><pre>' + window.TaiYiData.PRINCIPLES + '</pre>';
    wrap.appendChild(det);

    // 白话文讲解（模块级 · 生动版）
    const ex = el('details', 'card explain');
    ex.innerHTML = '<summary>白话文讲解（通俗解读）</summary><div class="explain-body">' +
      '<p><b>这三个，是传统术数里的"天花板级玩法"：</b></p><ul>' +
      '<li><b>太乙神数</b>：古称"测天"，管国运、灾异、天时气运，多言天道，民间很少流传——相当于术数里的"宏观战略部"。</li>' +
      '<li><b>大六壬</b>：古称"测人"，专决民间百事，盘面以"四课三传"为骨架——相当于术数里的"战术参谋"。</li>' +
      '<li><b>铁板神数</b>：以生辰取数对应"条文"，号称能"考时定刻"反推你出生时辰——相当于术数里的"精密档案室"。</li></ul>' +
      '<p><b>盘面上那些部件是啥：</b>"四课三传"是六壬推演事态的骨架——四课＝上下两组"神"的关系（像把一件事的正反面摆出来），三传＝事情发展的初、中、末三步；"局数"是太乙给时空编的号；"条文"是铁板对应的断语条目（像查字典翻到的那一条）。</p>' +
      '<p class="eg">💡 打个比方：太乙像"看天气大势"，六壬像"看眼前这步棋怎么走"，铁板像"翻老档案找对应条目"。三者都极繁极难，专业人士穷其一生也未必精通。</p>' +
      '<p class="tip">⚠ 重要提醒：本模块的"四课三传/局数/条文"都是<b>演示性简化模型</b>，只展示盘面"长什么样"，并非按古法（九宗门、太乙积年、考时定刻）求得，<b>绝对不能用来算命</b>。想真研究，请啃专业典籍，别拿这儿的解闷小演示当真。</p>' +
      '</div>';
    wrap.appendChild(ex);

    // 三大介绍
    ['TAIYI', 'LIUREN', 'TIEBAN'].forEach(k => {
      const s = window.TaiYiData[k];
      const c = el('div', 'card');
      c.innerHTML = '<h3>' + s.title + '</h3><pre class="poem">' + s.body + '</pre>';
      wrap.appendChild(c);
    });

    // 大六壬 简化演示
    wrap.appendChild(liurenSection());
    // 太乙 简化演示
    wrap.appendChild(taiyiSection());
    // 铁板 简化演示
    wrap.appendChild(tiebanSection());

    // 简化说明
    const note = el('div', 'card');
    note.innerHTML = '<h3>简化范围说明</h3><p class="warn">' + window.TaiYiData.SIMPLIFIED_NOTE + '</p></div>';
    wrap.appendChild(note);

    wrap.appendChild(el('p', 'disclaimer', '免责声明：本工具仅供娱乐与文化研究，所有结果不代表任何医疗、财务、法律或人生建议。请理性看待，切勿迷信。'));
    return wrap;
  };

  function liurenSection() {
    const c = el('div', 'card');
    c.innerHTML = '<h3>大六壬 · 简化四课三传演示</h3>' +
      '<p>基于你档案中的生日取日干支，并自选"占时"，演示四课三传的盘面形状。' +
      '（真实六壬需"月将加占时"与九宗门发用，此处为演示性简化。）</p>';
    const f = el('div', 'profile-form');
    const r = el('div', 'field');
    r.innerHTML = '<label>占时（地支）</label>';
    const sel = el('select'); sel.id = 'ty-zhanshi';
    window.TaiYi.ZHI.forEach(z => sel.appendChild(new Option(z + '时', z)));
    sel.value = '午';
    r.appendChild(sel); f.appendChild(r);
    c.appendChild(f);
    const btn = el('button', 'primary', '演示四课三传');
    btn.onclick = runLiuren;
    c.appendChild(btn);
    const rep = el('div', 'report'); rep.id = 'ty-liuren';
    c.appendChild(rep);
    return c;
  }

  function runLiuren() {
    const date = document.getElementById('p-date').value;
    if (!date) { alert('请在上方档案填写出生日期'); return; }
    const [y, mo, d] = date.split('-').map(Number);
    let dayGZ;
    if (window.BaZi) dayGZ = window.BaZi.compute({ year: y, month: mo, day: d, hour: null, gender: '男' }).pillars.dayGZ;
    else { alert('八字核心未加载，无法取日干支'); return; }
    const zhan = document.getElementById('ty-zhanshi').value;
    const r = window.TaiYi.liurenDemo({ dayGan: dayGZ[0], dayZhi: dayGZ[1], zhanShi: zhan });
    const box = document.getElementById('ty-liuren');
    box.innerHTML = '';
    let h = '<p>日干支：<b>' + r.dayGanZhi + '</b> ｜ 占时：<b>' + r.zhanShi + '</b></p>';
    h += '<h4>四课</h4><table class="pillars"><thead><tr><th>课</th><th>上神</th><th>下神</th></tr></thead><tbody>';
    r.siKe.forEach(k => { h += '<tr><td>' + k.name + '</td><td class="big">' + k.top + '</td><td>' + k.bottom + '</td></tr>'; });
    h += '</tbody></table>';
    h += '<h4>三传</h4><ul class="rel">';
    r.sanChuan.forEach(t => { h += '<li><b>' + t.name + '</b>：' + t.value + '</li>'; });
    h += '</ul><p class="muted">' + r.note + '</p>';
    h += '<p class="muted">排盘步骤：' + window.TaiYiData.LIUREN_STEPS.join(' → ') + '</p>';
    box.innerHTML = h;
  }

  function taiyiSection() {
    const c = el('div', 'card');
    c.innerHTML = '<h3>太乙神数 · 简化局数演示</h3><p>输入公历年份，演示"局数"之形状（真实太乙以积年起算）。</p>';
    const f = el('div', 'profile-form');
    const r = el('div', 'field');
    r.innerHTML = '<label>公历年份</label>';
    const inp = el('input'); inp.type = 'text'; inp.id = 'ty-year';
    const pd = document.getElementById('p-date').value;
    inp.value = pd ? pd.split('-')[0] : '2026';
    r.appendChild(inp); f.appendChild(r);
    c.appendChild(f);
    const btn = el('button', 'primary', '演示局数');
    btn.onclick = () => {
      const y = document.getElementById('ty-year').value;
      const r2 = window.TaiYi.taiyiJu({ year: y });
      document.getElementById('ty-taiyi').innerHTML =
        '<p>公元 <b>' + r2.year + '</b> 年 → 示意局数 <b>' + r2.jv + '</b>（' + r2.yinYang + '）</p>' +
        '<p class="muted">' + r2.note + '</p>';
    };
    c.appendChild(btn);
    const rep = el('div', 'report'); rep.id = 'ty-taiyi';
    c.appendChild(rep);
    return c;
  }

  function tiebanSection() {
    const c = el('div', 'card');
    c.innerHTML = '<h3>铁板神数 · 简化条文演示</h3><p>取你档案的生日与性别，演示"条文编号"之形状（真实铁板需考时定刻、查秘本条文）。</p>';
    const btn = el('button', 'primary', '演示条文');
    btn.onclick = () => {
      const date = document.getElementById('p-date').value;
      if (!date) { alert('请在上方档案填写出生日期'); return; }
      const [y, mo, d] = date.split('-').map(Number);
      let dayGZ;
      if (window.BaZi) dayGZ = window.BaZi.compute({ year: y, month: mo, day: d, hour: null, gender: '男' }).pillars.dayGZ;
      else { alert('八字核心未加载'); return; }
      const gender = ($('input[name=gender]:checked') || {}).value || '男';
      const r = window.TaiYi.tiebanTiao({ dayGan: dayGZ[0], dayZhi: dayGZ[1], gender });
      document.getElementById('ty-tieban').innerHTML =
        '<p>日干支 <b>' + r.dayGanZhi + '</b> ｜ 性别 <b>' + r.gender + '</b> → 示意条文编号 <b>第 ' + r.tiao + ' 条</b></p>' +
        '<p class="muted">' + r.note + '</p>';
    };
    c.appendChild(btn);
    const rep = el('div', 'report'); rep.id = 'ty-tieban';
    c.appendChild(rep);
    return c;
  }

  function $(s, p) { return (p || document).querySelector(s); }
})();
