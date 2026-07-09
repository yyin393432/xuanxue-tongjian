/*
 * app.js — 玄学通鉴 前端逻辑（常驻个人档案 + 模块路由 + 报告渲染）
 * 纯前端，无后端；计算走 js/core 下的离线模块。
 */
(function () {
  'use strict';

  // ===== 模块注册表（21 类，八字先行，其余预留）=====
  const MODULES = [
    { id: 'bazi', name: '八字', desc: '四柱排盘 · 五行 · 十神 · 神煞 · 称骨', status: 'ready' },
    { id: 'ziwei', name: '紫微斗数', desc: '十二宫命盘 · 十四主星 · 四化', status: 'ready' },
    { id: 'liuyao', name: '六爻', desc: '纳甲 · 世应 · 六亲 · 六神', status: 'ready' },
    { id: 'qimen', name: '奇门遁甲', desc: '排盘 · 九宫 · 八门 · 九星', status: 'ready' },
    { id: 'yijing', name: '易经', desc: '起卦 · 卦象 · 爻辞（含梅花易数）', status: 'ready' },
    { id: 'chenggu', name: '称骨算命', desc: '袁天罡骨重 · 称骨歌', status: 'ready-in-bazi' },
    { id: 'wuxing', name: '五行八卦', desc: '五行缺补 · 日主强弱', status: 'ready-in-bazi' },
    { id: 'shensha', name: '神煞', desc: '桃花·驿马·华盖·将星·天乙·文昌·羊刃·天德月德', status: 'ready-in-bazi' },
    { id: 'shengxiao', name: '生肖', desc: '本命年 · 冲太岁 · 三合六冲', status: 'ready' },
    { id: 'xingzuo', name: '星座', desc: '太阳星座 · 性格 · 运势', status: 'ready' },
    { id: 'xingming', name: '姓名', desc: '五格剖象 · 三才配置', status: 'ready' },
    { id: 'shengri', name: '生日', desc: '生命灵数 · 生日密码', status: 'ready' },
    { id: 'fengshui', name: '风水', desc: '择日 · 方位吉凶 · 黄道吉日', status: 'ready' },
    { id: 'jiemeng', name: '解梦', desc: '梦象词典', status: 'ready' },
    { id: 'cezi', name: '测字', desc: '汉字拆解占卜', status: 'ready' },
    { id: 'shuzi', name: '数字能量', desc: '手机号 · 车牌 · 河洛数理', status: 'ready' },
    { id: 'hemwei', name: '合婚', desc: '八字合婚 · 星座配对', status: 'ready' },
    { id: 'liunian', name: '流年运势', desc: '大运流年 · 年度运程', status: 'ready' },
    { id: 'taiyi', name: '太乙/大六壬/铁板', desc: '传统术数支流（简化科普）', status: 'ready' },
    { id: 'mianxiang', name: '面相/手相/痣相', desc: '引导式图文问答', status: 'ready' },
    { id: 'qianshi', name: '前世今生', desc: '创意娱乐生成（仅供娱乐）', status: 'ready' }
  ];

  const SHICHEN = [
    { label: '子时（23:00–01:00）', hour: 0 },
    { label: '丑时（01:00–03:00）', hour: 2 },
    { label: '寅时（03:00–05:00）', hour: 4 },
    { label: '卯时（05:00–07:00）', hour: 6 },
    { label: '辰时（07:00–09:00）', hour: 8 },
    { label: '巳时（09:00–11:00）', hour: 10 },
    { label: '午时（11:00–13:00）', hour: 12 },
    { label: '未时（13:00–15:00）', hour: 14 },
    { label: '申时（15:00–17:00）', hour: 16 },
    { label: '酉时（17:00–19:00）', hour: 18 },
    { label: '戌时（19:00–21:00）', hour: 20 },
    { label: '亥时（21:00–23:00）', hour: 22 }
  ];
  const GAIKUANG = [
    { label: '凌晨（23:00–05:00，按子时估算）', hour: 0 },
    { label: '上午（05:00–11:00，按辰时估算）', hour: 8 },
    { label: '下午（11:00–17:00，按申时估算）', hour: 16 },
    { label: '晚上（17:00–23:00，按戌时估算）', hour: 20 }
  ];

  const $ = (s, p) => (p || document).querySelector(s);
  const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };

  // 中文序号（菜单用，一..廿一）
  const CN_NUM = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十', '十一', '十二', '十三', '十四', '十五', '十六', '十七', '十八', '十九', '二十', '廿一'];

  // ===== 渲染菜单 =====
  function renderMenu() {
    const box = $('#menu');
    box.innerHTML = '';
    MODULES.forEach((m, i) => {
      const item = el('button', 'menu-item' + (m.status === 'ready' ? ' ready' : ''));
      item.dataset.id = m.id;
      item.innerHTML = '<span class="m-name">' + (CN_NUM[i + 1] || (i + 1)) + ' · ' + m.name + '</span><span class="m-desc">' + m.desc + '</span>' +
        (m.status === 'ready' ? '<span class="m-tag">可用</span>' : (m.status === 'ready-in-bazi' ? '<span class="m-tag sub">含于八字</span>' : '<span class="m-tag soon">敬请期待</span>'));
      item.onclick = () => selectModule(m.id);
      box.appendChild(item);
    });
  }

  function selectModule(id) {
    document.querySelectorAll('.menu-item').forEach(b => b.classList.toggle('active', b.dataset.id === id));
    const m = MODULES.find(x => x.id === id);
    const stage = $('#stage');
    stage.innerHTML = '';
    if (window.PANELS && typeof window.PANELS[id] === 'function') {
      try { stage.appendChild(window.PANELS[id]()); }
      catch (e) { stage.innerHTML = '<div class="soon-panel"><h2>' + m.name + '</h2><p class="warn">模块加载出错：' + e.message + '</p></div>'; }
    } else if (id === 'bazi' || id === 'chenggu' || id === 'wuxing' || id === 'shensha') {
      stage.appendChild(baziPanel());
    } else {
      stage.innerHTML = '<div class="soon-panel"><h2>' + m.name + '</h2><p>' + m.desc + '</p><p class="muted">该模块正在开发中，敬请期待。本版已收入模块注册表，后续按统一模板接入即可。</p></div>';
    }
  }

  // ===== 常驻「个人档案」卡片（切换模块不清空）=====
  function buildProfile() {
    const box = $('#profile');
    box.innerHTML = '';
    const card = el('div', 'card profile-card');
    card.innerHTML = '<h3>个人档案</h3><p class="muted" style="margin-top:-4px">常用信息只需填一次，切换模块自动保留；姓名用于「姓名」模块，出生地用于八字真太阳时校正。</p>';
    const f = el('div', 'profile-form');

    // 生日
    const r1 = el('div', 'field');
    r1.innerHTML = '<label>公历出生日期</label>';
    const date = el('input'); date.type = 'date'; date.id = 'p-date'; date.max = '2100-12-31'; date.value = '1990-05-20';
    r1.appendChild(date); f.appendChild(r1);

    // 时辰
    const r2 = el('div', 'field');
    r2.innerHTML = '<label>出生时辰（记不清可选「不详」）</label>';
    const sel = el('select'); sel.id = 'p-hour';
    sel.appendChild(new Option('不详（记不清出生时间）', 'unknown'));
    const g1 = el('optgroup'); g1.label = '精确时辰';
    SHICHEN.forEach(s => g1.appendChild(new Option(s.label, String(s.hour))));
    sel.appendChild(g1);
    const g2 = el('optgroup'); g2.label = '大概时段（按中间时辰估算，仅供参考）';
    GAIKUANG.forEach(s => g2.appendChild(new Option(s.label, 'est:' + s.hour)));
    sel.appendChild(g2);
    r2.appendChild(sel); f.appendChild(r2);

    // 性别
    const r3 = el('div', 'field');
    r3.innerHTML = '<label>性别</label>';
    const seg = el('div', 'seg');
    seg.innerHTML = '<label class="seg-l"><input type="radio" name="gender" value="男" checked> 男</label>' +
      '<label class="seg-l"><input type="radio" name="gender" value="女"> 女</label>';
    r3.appendChild(seg); f.appendChild(r3);

    // 出生地（真太阳时）
    const r4 = el('div', 'field');
    r4.innerHTML = '<label>出生地（用于真太阳时校正）</label>';
    const place = el('input'); place.type = 'text'; place.id = 'p-place'; place.placeholder = '如：北京 / 上海 / 乌鲁木齐';
    const dl = el('datalist'); dl.id = 'city-list';
    Object.keys(Cities.TABLE).forEach(c => dl.appendChild(new Option(c, c)));
    place.setAttribute('list', 'city-list');
    r4.appendChild(place); r4.appendChild(dl); f.appendChild(r4);

    // 姓名
    const r5 = el('div', 'field');
    r5.innerHTML = '<label>姓名（用于姓名学模块）</label>';
    const nm = el('input'); nm.type = 'text'; nm.id = 'p-name'; nm.placeholder = '如：张三';
    r5.appendChild(nm); f.appendChild(r5);

    card.appendChild(f);
    box.appendChild(card);
  }

  // ===== 八字 面板（读取档案，不含重复输入）=====
  function baziPanel() {
    const wrap = el('div', 'form-wrap');
    wrap.appendChild(el('h2', null, '八字排盘'));
    wrap.appendChild(el('p', 'muted', '信息取自上方「个人档案」。点击下方按钮排盘；若时辰不详，论断会自动标注影响范围。'));

    const btn = el('button', 'primary', '开始排盘（八字）');
    btn.onclick = runBazi;
    wrap.appendChild(btn);

    const report = el('div', 'report'); report.id = 'report';
    wrap.appendChild(report);
    return wrap;
  }

  function runBazi() {
    const date = $('#p-date').value;
    if (!date) { alert('请在上方档案填写出生日期'); return; }
    const [y, mo, d] = date.split('-').map(Number);
    const hourSel = $('#p-hour').value;
    let hour = null, est = false;
    if (hourSel !== 'unknown') {
      if (hourSel.indexOf('est:') === 0) { est = true; hour = parseInt(hourSel.slice(4), 10); }
      else hour = parseInt(hourSel, 10);
    }
    const gender = ($('input[name=gender]:checked') || {}).value || '男';
    const birthplace = ($('#p-place').value || '').trim();
    const name = ($('#p-name').value || '').trim();
    const longitude = Cities.lookup(birthplace);

    const r = BaZi.compute({ year: y, month: mo, day: d, hour, gender, longitude, birthplace: birthplace || null, name: name || null });
    renderReport(r, est);
    const rep = $('#report');
    if (rep && rep.scrollIntoView) rep.scrollIntoView({ behavior: 'smooth' });
  }

  // ===== 报告渲染 =====
  function renderReport(r, est) {
    const box = $('#report');
    box.innerHTML = '';

    // 科普原理
    const det = el('details', 'card principle');
    det.open = true;
    det.innerHTML = '<summary>命理科普（先看这里）</summary><pre>' + BaziText.PRINCIPLES + '</pre>';
    box.appendChild(det);

    // 基本信息
    const info = el('div', 'card');
    let infoHtml = '<h3>基本信息</h3>' +
      row2('公历', r.solarText) +
      row2('农历', r.ganZhiYearText + '年 ' + r.lunarText) +
      row2('生肖', r.shengxiao) +
      (r.name ? row2('姓名', r.name + '（姓名学详见「姓名」模块）') : '');
    // 真太阳时说明
    if (r.trueSolar) {
      const ts = r.trueSolar;
      const hh = Math.floor(ts.hourFloat); const mm = Math.round((ts.hourFloat - hh) * 60);
      const p2 = (n) => (n < 10 ? '0' + n : '' + n);
      infoHtml += row2('真太阳时', ts.year + '-' + ts.month + '-' + ts.day + ' ' + p2(hh) + ':' + p2(mm) +
        '（' + (r.birthplace || '') + '，经度 ' + r.longitude + '°E）');
      const diff = r.beijingZhi !== ts.zhi;
      infoHtml += row2('时辰校正', '北京时 ' + r.beijingZhi + '时 → 真太阳时 ' + ts.zhi + '时' +
        (diff ? '（已跨时辰，已校正）' : '（一致，无需校正）'));
    } else if (r.birthplace && r.longitude == null) {
      infoHtml += row2('真太阳时', '未识别出生地，按北京时间(120°E)起算；如需精确校正请选列表内城市');
    }
    infoHtml += (r.timeUnknown
      ? '<p class="warn">⚠ 时辰不详：时柱缺失，子女 / 晚年 / 六亲相关论断从略；其余结果正常。</p>'
      : (est ? '<p class="warn">⚠ 时辰为「大概时段」估算值，时柱仅供参考，精确时辰可提升准确度。</p>' : ''));
    info.innerHTML = infoHtml;
    box.appendChild(info);

    // 四柱排盘
    const pillars = [
      { name: '年柱', gz: r.pillars.yearGZ, ss: r.shiShenMap.year, nayin: r.nayin.year, zhi: r.pillars.yearGZ[1] },
      { name: '月柱', gz: r.pillars.monthGZ, ss: r.shiShenMap.month, nayin: r.nayin.month, zhi: r.pillars.monthGZ[1] },
      { name: '日柱', gz: r.pillars.dayGZ, ss: r.shiShenMap.day, nayin: r.nayin.day, zhi: r.pillars.dayGZ[1], isDay: true },
      r.pillars.timeGZ ? { name: '时柱', gz: r.pillars.timeGZ, ss: r.shiShenMap.time, nayin: r.nayin.time, zhi: r.pillars.timeGZ[1] } : null
    ].filter(Boolean);

    const pt = el('div', 'card');
    let html = '<h3>四柱排盘</h3><table class="pillars"><thead><tr><th>柱</th><th>天干</th><th>十神</th><th>地支</th><th>藏干</th><th>纳音</th></tr></thead><tbody>';
    pillars.forEach(p => {
      const cang = (WuXing.ZHI_CANG[p.zhi] || []).join('');
      html += '<tr' + (p.isDay ? ' class="day-row"' : '') + '>' +
        '<td>' + p.name + (p.isDay ? '（日主）' : '') + '</td>' +
        '<td class="big">' + p.gz[0] + '</td>' +
        '<td>' + (p.ss.gan || '—') + '</td>' +
        '<td class="big">' + p.gz[1] + '</td>' +
        '<td>' + cang + '</td>' +
        '<td>' + (p.nayin || '—') + '</td></tr>';
      html += '<tr class="sub-row"><td></td><td></td><td>' + (p.ss.zhi ? '<span class="muted">支:' + p.ss.zhi + '</span>' : '') + '</td><td></td><td></td><td></td></tr>';
    });
    html += '</tbody></table>';
    pt.innerHTML = html;
    box.appendChild(pt);

    // 五行分布
    const wu = el('div', 'card');
    let max = Math.max.apply(null, WuXing.WUXING_ORDER.map(w => r.totalWu[w]));
    max = max || 1;
    let bars = '';
    WuXing.WUXING_ORDER.forEach(w => {
      const v = r.totalWu[w];
      const pct = Math.round(v / max * 100);
      bars += '<div class="bar"><span class="bl">' + w + '</span><span class="bt" style="width:' + pct + '%"></span><span class="bv">' + v + '</span></div>';
    });
    wu.innerHTML = '<h3>五行分布</h3>' + bars +
      '<p>日主 <b>' + r.dayGan + '（' + r.dayW + '）</b> · <b>' + r.strength + '</b>（评分 ' + r.score + '，简版估算）</p>' +
      '<p class="muted">五行释义：' + WuXing.WUXING_ORDER.map(w => w + '—' + BaziText.WUXING_DESC[w]).join('；') + '</p>';
    box.appendChild(wu);

    // 神煞（计数版）
    const ss = el('div', 'card');
    const hitTypes = r.shensha.filter(s => s.count > 0);
    const totalOcc = r.shensha.reduce((a, s) => a + s.count, 0);
    let sh = '<h3>神煞</h3>';
    sh += '<p class="muted">命带 <b>' + hitTypes.length + '</b> 类神煞，共 <b>' + totalOcc + '</b> 处。</p><ul class="shensha">';
    r.shensha.forEach(s => {
      const hit = s.count > 0;
      const cnt = hit ? ' <b class="cnt">×' + s.count + '</b>' : '';
      const where = hit ? '（命中：' + s.hits.join('、') + '）' : '（未命中）';
      sh += '<li class="' + (hit ? 'hit' : 'miss') + '">' + (hit ? '✓ ' : '· ') +
        '<b>' + s.name + '</b>' + cnt + '：' + s.detail + where + '</li>';
    });
    sh += '</ul>';
    ss.innerHTML = sh;
    box.appendChild(ss);

    // 称骨
    const cg = el('div', 'card');
    const c = r.chenggu;
    cg.innerHTML = '<h3>称骨算命</h3>' +
      '<p>年 ' + ChengGu.fmt(c.parts.year) + ' ＋ 月 ' + ChengGu.fmt(c.parts.month) + ' ＋ 日 ' + ChengGu.fmt(c.parts.day) +
      (c.parts.timeKnown ? ' ＋ 时 ' + ChengGu.fmt(c.parts.time) : ' ＋ 时（不详）') + ' ＝ <b>' + c.totalText + '</b></p>' +
      '<blockquote>' + c.poem + '</blockquote>';
    box.appendChild(cg);

    // 白话文讲解（通俗解读）
    box.appendChild(baihuaBazi(r, est));

    // 免责
    box.appendChild(el('p', 'disclaimer', '免责声明：本工具仅供娱乐与文化研究，所有结果不代表任何医疗、财务、法律或人生建议。请理性看待，切勿迷信。'));
  }

  // ===== 八字白话文讲解（人话版）=====
  function baihuaBazi(r, est) {
    const box = el('details', 'card explain');
    let h = '<summary>白话文讲解（通俗解读 · 人话版）</summary><div class="explain-body">';

    h += '<p><b>先说人话：</b>所谓"八字"，就是把你出生的年、月、日、时，各用一对"天干+地支"表示，共四对八个字，相当于你出生那一刻的"时空坐标"。古人认为这个坐标与性格、运势走向有关——这是传统文化视角，<b>仅供娱乐参考</b>。</p>';

    const strengthWord = r.strength.indexOf('强') >= 0 ? '偏强' : (r.strength.indexOf('弱') >= 0 ? '偏弱' : '中和');
    h += '<p><b>你的"日主"是 ' + r.dayGan + '（五行属' + r.dayW + '）：</b>"日主"代表命盘里的"你本人"。你的日主' + strengthWord +
      '（简版评分 ' + r.score + '）。' +
      (strengthWord === '偏弱' ? '偏弱一般理解为：你更需要"同类"（' + r.dayW + '）或"生你者"来帮扶，性格上可能偏温和、需要外界助力。'
        : strengthWord === '偏强' ? '偏强一般理解为：你自身能量足，性格可能更主动有主见，但也要注意"过刚易折"，适当收敛锋芒。'
        : '中和一般理解为：自身能量较均衡，适应面较广。') +
      '</p>';

    const order = WuXing.WUXING_ORDER;
    const entries = order.map(w => ({ w: w, v: r.totalWu[w] || 0 })).sort((a, b) => b.v - a.v);
    const maxW = entries[0], minW = entries[entries.length - 1];
    h += '<p><b>五行分布：</b>你命中「' + maxW.w + '」最旺（' + maxW.v + '），「' + minW.w + '」最弱（' + minW.v + '）。' +
      (minW.v === 0 ? '其中「' + minW.w + '」为 0，民间俗称"缺' + minW.w + '"——这只是五行统计，不代表吉凶，补不补见仁见智。'
        : '五行相对均衡，无明显偏废。') +
      '五行一句话：' + order.map(w => w + '—' + (BaziText.WUXING_DESC[w] || '')).join('；') + '。</p>';

    const daySS = r.shiShenMap.day;
    h += '<p><b>十神（你与周围关系的"角色卡"）：</b>以日干为中心，其他干支被分成十种"神"——比劫（同我）、食伤（我生）、财（我克）、官杀（克我）、印（生我），再分正偏。你日柱天干十神为「' + (daySS.gan || '—') + '」、地支藏干十神为「' + (daySS.zhi || '—') + '」。比如正官主规矩责任、正财主稳定收入、正印主学识庇护——具体组合要结合全盘看。</p>';

    const hitS = r.shensha.filter(s => s.count > 0);
    const explainMap = {
      '桃花': '主异性缘、人缘与情感机遇，命带桃花通常更讨喜、社交活跃。',
      '驿马': '主走动、变动、远行或环境变迁，命带驿马者往往不安分、易离家发展。',
      '华盖': '主聪明、孤高、喜玄学艺术，常独立思考、带点清冷气质。',
      '文昌': '主学业、文才与考试运，利于读书与文字工作。',
      '天乙贵人': '主贵人相助、逢凶化吉，遇事易得他人帮扶。',
      '将星': '主领导才能与气场，易在群体中崭露头角。',
      '羊刃': '主刚烈、决断，也带冲动之象，需以柔克刚。',
      '天德': '主福德、化解灾厄，是吉神。',
      '月德': '主平和、积善，也是吉神。',
      '劫煞': '主波折、是非，需注意人际与财物。',
      '灾煞': '主意外与小灾，宜谨慎。',
      '孤辰': '主孤独、独立，感情上宜主动经营。',
      '寡宿': '主清静、内向，宜多融入人群。',
      '空亡': '主虚浮、落空，相关事项易有始无终，宜务实。'
    };
    if (hitS.length) {
      h += '<p><b>你命带 ' + hitS.length + ' 类神煞（共 ' + r.shensha.reduce((a, s) => a + s.count, 0) + ' 处），挑几个用人话讲：</b></p><ul>';
      hitS.forEach(s => {
        h += '<li><b>' + s.name + '×' + s.count + '</b>：' + (explainMap[s.name] || s.detail) + '（命中：' + s.hits.join('、') + '）</li>';
      });
      h += '</ul>';
    } else {
      h += '<p><b>神煞：</b>本次常用神煞均未命中，属正常情况。</p>';
    }

    const c = r.chenggu;
    h += '<p><b>称骨：</b>你的"骨重"合计 <b>' + c.totalText + '</b>。对应称骨歌：' + c.poem + '（袁天罡称骨法传统断语，含文学夸张，理性看待。）</p>';

    h += '<p class="tip">以上为通俗化解读，帮你"看明白"排盘结果。命理流派多、口径不一，本工具为简化科普版，切勿用于人生重大决策。</p>';
    h += '</div>';
    box.innerHTML = h;
    return box;
  }

  function row2(k, v) { return '<div class="kv"><span class="k">' + k + '</span><span class="v">' + v + '</span></div>'; }

  // ===== 启动 =====
  function init() {
    renderMenu();
    buildProfile();
    selectModule('bazi');
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
