/*
 * overview.js — 综合命盘 · 总览面板（汇总八字/紫微/星座/流年等多维信息）
 */
(function () {
  'use strict';
  const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  }
  function topWuxing(tw) {
    if (!tw) return '';
    let top = '', max = -1;
    ['木', '火', '土', '金', '水'].forEach(w => { if ((tw[w] || 0) > max) { max = tw[w] || 0; top = w; } });
    return top;
  }

  window.PANELS = window.PANELS || {};
  window.PANELS['zonglan'] = function () {
    const wrap = el('div', 'form-wrap');
    wrap.appendChild(el('h2', null, '综合命盘 · 总览'));
    wrap.appendChild(el('p', 'muted', '一次性汇总八字、紫微、星座、流年等维度，先看个大概。信息取自上方「个人档案」。'));
    const btn = el('button', 'primary', '生成综合命盘');
    btn.onclick = run;
    wrap.appendChild(btn);
    const report = el('div', 'report'); report.id = 'zonglan-report';
    wrap.appendChild(report);
    return wrap;
  };

  function getProfile() {
    const date = document.getElementById('p-date').value;
    if (!date) return null;
    const [y, mo, d] = date.split('-').map(Number);
    const hourSel = document.getElementById('p-hour').value;
    let hour = null;
    if (hourSel !== 'unknown') hour = parseInt(hourSel.replace('est:', ''), 10);
    const gender = (document.querySelector('input[name=gender]:checked') || {}).value || '男';
    const name = (document.getElementById('p-name').value || '').trim();
    const birthplace = (document.getElementById('p-place') || {}).value || '';
    const longitude = (window.Cities && birthplace) ? window.Cities.lookup(birthplace) : null;
    return { y, mo, d, hour, gender, name, birthplace, longitude };
  }

  function run() {
    const p = getProfile();
    if (!p) { alert('请在上方档案填写出生日期'); return; }
    let bz = null, zw = null, xz = null, ln = null;
    try { bz = BaZi.compute({ year: p.y, month: p.mo, day: p.d, hour: p.hour, gender: p.gender, longitude: p.longitude, birthplace: p.birthplace || null, name: p.name || null }); } catch (e) {}
    try { zw = ZiWei.compute({ year: p.y, month: p.mo, day: p.d, hour: p.hour, gender: p.gender, name: p.name || null }); } catch (e) {}
    try { xz = XingZuo.compute({ month: p.mo, day: p.d }); } catch (e) {}
    try { ln = LiuNian.compute({ year: p.y, month: p.mo, day: p.d, hour: p.hour, gender: p.gender, name: p.name || null, fromYear: new Date().getFullYear(), years: 6 }); } catch (e) {}
    render({ bz, zw, xz, ln, p });
    const rep = document.getElementById('zonglan-report');
    if (rep && rep.scrollIntoView) rep.scrollIntoView({ behavior: 'smooth' });
  }

  function render(o) {
    const { bz, zw, xz, ln, p } = o;
    const box = document.getElementById('zonglan-report');
    box.innerHTML = '';
    if (!bz && !zw && !xz && !ln) { box.appendChild(el('p', 'warn', '暂时无法生成总览，请检查档案信息后重试。')); return; }

    const prof = el('div', 'card');
    prof.innerHTML = '<h3>档案摘要</h3>' +
      '<div class="kv"><span class="k">公历</span><span class="v">' + esc(p.y + '年' + p.mo + '月' + p.d + '日' + (p.hour != null ? p.hour + '时' : '（时辰不详）')) + '</span></div>' +
      (bz ? '<div class="kv"><span class="k">生肖</span><span class="v">' + esc(bz.shengxiao) + '</span></div>' : '') +
      (p.birthplace ? '<div class="kv"><span class="k">出生地</span><span class="v">' + esc(p.birthplace) + (p.longitude != null ? '（经度 ' + p.longitude + '°E）' : '') + '</span></div>' : '');
    box.appendChild(prof);

    if (bz) {
      const c = el('div', 'card');
      let h = '<h3>八字 · 五行</h3>';
      h += '<div class="kv"><span class="k">日主</span><span class="v">' + esc(bz.dayW) + '（' + esc(bz.dayGan) + '）</span></div>';
      h += '<div class="kv"><span class="k">强弱</span><span class="v">' + esc(bz.strength) + '</span></div>';
      h += '<div class="kv"><span class="k">称骨</span><span class="v">' + (bz.chenggu && bz.chenggu.totalText ? esc(bz.chenggu.totalText) : '—') + '</span></div>';
      c.innerHTML = h;
      box.appendChild(c);
      if (window.SVGKit) box.insertAdjacentHTML('beforeend', window.SVGKit.baziWuxing(bz.totalWu, bz.dayW, bz.strength));
    }

    if (zw) {
      const c = el('div', 'card');
      const mg = zw.gongs[0];
      let h = '<h3>紫微 · 命宫</h3>';
      h += '<div class="kv"><span class="k">命宫</span><span class="v">' + esc(zw.mingGong.zhi) + '宫</span></div>';
      h += '<div class="kv"><span class="k">主星</span><span class="v">' + (mg.stars.length ? esc(mg.stars.join('、')) : '<span class="muted">（空）</span>') + '</span></div>';
      c.innerHTML = h;
      box.appendChild(c);
      if (window.SVGKit) box.insertAdjacentHTML('beforeend', window.SVGKit.ziweiChart(zw.gongs, zw.mingGong, zw.shenGong));
    }

    if (xz) {
      const c = el('div', 'card');
      const traitsTxt = Array.isArray(xz.traits) ? xz.traits.slice(0, 2).join('、') : (xz.traits || '');
      c.innerHTML = '<h3>星座</h3>' +
        '<div class="kv"><span class="k">太阳星座</span><span class="v">' + esc(xz.name) + '</span></div>' +
        (traitsTxt ? '<p class="muted">' + esc(traitsTxt) + '</p>' : '');
      box.appendChild(c);
    }

    if (ln) {
      const c = el('div', 'card');
      const cur = ln.liunians && ln.liunians[0];
      let h = '<h3>流年 · 大运</h3>';
      h += '<div class="kv"><span class="k">起运</span><span class="v">约 ' + esc(ln.startAge) + ' 岁</span></div>';
      if (cur) h += '<div class="kv"><span class="k">' + cur.year + '年（' + (cur.age || '—') + '岁）</span><span class="v">流年 ' + esc(cur.gz) + ' ｜ ' + esc(cur.taiSuiDesc || '平顺') + '</span></div>';
      h += '<p class="muted">未来几年流年：' + ln.liunians.slice(0, 6).map(l => esc(l.gz) + (l.taiSui && l.taiSui !== 'none' ? '(' + esc(l.taiSuiDesc || '') + ')' : '')).join('、') + '</p>';
      c.innerHTML = h;
      box.appendChild(c);
    }

    const sum = el('div', 'card explain');
    sum.innerHTML = '<details open><summary>白话文讲解（综合解读）</summary><div class="explain-body">' + zonglanText(o) + '</div></details>';
    box.appendChild(sum);

    box.appendChild(el('p', 'disclaimer', '免责声明：本工具仅供娱乐与文化研究，所有结果不代表任何医疗、财务、法律或人生建议。请理性看待，切勿迷信。各维度详细算法与口径见对应模块。'));
  }

  function zonglanText(o) {
    const { bz, zw, xz, ln } = o;
    const parts = [];
    parts.push('综合命盘，就像把同一个人用四套不同的"滤镜"各拍一张照片——八字看先天能量底色，紫微看十二宫人生地图，星座看外界第一印象，流年看时间轴上的起伏。四张照片拼一起，才勉强凑出个"立体轮廓"。');
    if (bz) parts.push('从八字这层看：你的日主为「' + esc(bz.dayW) + '（' + esc(bz.dayGan) + '）」，整体' + esc(bz.strength) + '，五行里' + esc(topWuxing(bz.totalWu)) + '最旺。这代表你先天的能量体质——好比有人天生"火力旺"，有人天生"需要被照顾"。');
    if (zw && zw.gongs[0].stars.length) parts.push('从紫微这层看：命宫落在' + esc(zw.mingGong.zhi) + '宫，主星为' + esc(zw.gongs[0].stars.join('、')) + '，是你性格与先天禀赋的核心"房客"。星曜组合，决定你这间"命宫"敞亮还是憋闷。');
    if (xz) parts.push('从星座这层看：太阳星座是' + esc(xz.name) + '，是你抛头露面时给别人留下的"第一印象标签"。它和八字、紫微未必一致——人本来就是多面的嘛。');
    if (ln) parts.push('从流年这层看：大运约' + esc(ln.startAge) + '岁起运；今年流年' + (ln.liunians[0] ? esc(ln.liunians[0].gz) : '') + '，' + (ln.liunians[0] && ln.liunians[0].taiSuiDesc ? esc(ln.liunians[0].taiSuiDesc) : '整体平顺') + '。这是你今年这趟"天气"的大致体感。');
    parts.push('💡 打个比方：这四套系统就像四个性格迥异的老前辈，各自给你的命运"提了句建议"。听着都挺有道理，但真过日子，还是得你自己拿主意。');
    parts.push('最后说句大实话：以上只是多维度拼出的「大概轮廓」，命理玄学尚无科学依据，仅供娱乐参考。你的人生剧本，终究是握在自己手里的——滤镜再好看，也得你自己去演。');
    return parts.map(t => '<p>' + t + '</p>').join('');
  }
})();
