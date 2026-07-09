/*
 * baihua.js — 玄学通鉴「白话文讲解」统一生成器
 * 挂 window.BaiHua，每个方法接收对应模块的 compute 结果，返回一段
 * <details class="card explain"> HTML 元素（人话版解读）。
 * 纯 UI 文本生成，无 DOM 副作用；在各面板 render 的免责声明之前插入即可。
 */
(function () {
  'use strict';
  const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };

  function wrap(summary, body) {
    const d = el('details', 'card explain');
    d.innerHTML = '<summary>' + summary + '</summary><div class="explain-body">' + body + '</div>';
    return d;
  }
  function tip() {
    return '<p class="tip">以上为通俗化解读，帮你"看明白"结果。命理流派多、口径不一，本工具为简化科普版，切勿用于人生重大决策。</p>';
  }

  window.BaiHua = {
    // ===== 六爻 =====
    liuyao: function (r) {
      if (!r) return wrap('白话文讲解（通俗解读）', '<p>暂无结果。</p>');
      const shi = (r.detail.find(l => l.yao === r.ben.shi) || {}).qin || '—';
      const ying = (r.detail.find(l => l.yao === r.ben.ying) || {}).qin || '—';
      let h = '<p><b>六爻是什么：</b>用铜钱摇六次得六个爻组成"本卦"，有动爻再变出"变卦"。它把你要问的事拆成"世爻（你/问事方）"和"应爻（对方/环境）"，再用六亲、六神、五行生克推断趋势。</p>';
      h += '<p><b>你的卦：</b>本卦「' + r.ben.name + '」（卦宫 ' + r.ben.gong + '）。世爻在第 ' + r.ben.shi + ' 爻，六亲为「' + shi + '」——代表你在此事中的角色心态；应爻在第 ' + r.ben.ying + ' 爻，六亲「' + ying + '」——代表对方或外界。</p>';
      h += '<p><b>六亲怎么看：</b>是"你与所问之事的关系"——问财看妻财、问工作看官鬼、问学业看父母、问子女看子孙、同辈看兄弟。本卦中可重点看这些六亲落在哪爻、旺衰如何。</p>';
      h += (r.dongCount > 0)
        ? '<p><b>动爻：</b>本卦有 ' + r.dongCount + ' 个动爻（标○/×），"动"意味着事态有变化转折，变卦即变化后的走向。下方"简断"已给综合判断。</p>'
        : '<p><b>动爻：</b>本卦无动爻（静卦），以本卦卦象与六爻整体旺衰参看。</p>';
      h += tip();
      return wrap('白话文讲解（通俗解读）', h);
    },

    // ===== 奇门遁甲 =====
    qimen: function (r) {
      if (!r) return wrap('白话文讲解（通俗解读）', '<p>暂无结果。</p>');
      const good = [];
      (r.cells || []).forEach(c => { if (['开门', '休门', '生门', '景门'].indexOf(c.men) >= 0) good.push(c.men + '在' + c.gong + '宫'); });
      let h = '<p><b>奇门遁甲是什么：</b>古人把时空排进"九宫格"，用三奇六仪（天干）、八门（人事）、九星（天时）、八神（神助）模拟局势，常用于择吉、布局、决策参考，古称"帝王之术"。</p>';
      h += '<p><b>本次定局：</b>' + r.jieqi + ' 节气，' + r.yinText + ' ' + r.ju + ' 局；日干支 ' + r.dayGZ + '，时干支 ' + r.timeGZ + '（时干落 ' + r.shiGanGong + ' 宫）。核心能量点「值符 ' + r.valueStar + '」，执行之门「值使 ' + r.zhiShiMen + '」。</p>';
      h += '<p><b>怎么看盘：</b>九宫里"吉门"落哪宫，往往提示该方位/领域有行动机会——' + (good.length ? good.join('；') + '。' : '本次吉门分布较散，结合值符值使所在宫细看。') + ' 开门主事业机遇、休门主休养、生门主生财、景门主文书名声。</p>';
      h += '<p class="tip">本盘为简化排盘（拆补思路、三元按日干、中宫寄坤、八神不入中宫），仅供文化了解与娱乐，深入占断请研习专业典籍，勿用于重大决策。</p>';
      return wrap('白话文讲解（通俗解读）', h);
    },

    // ===== 易经 =====
    yijing: function (r) {
      if (!r || !r.ben) return wrap('白话文讲解（通俗解读）', '<p>暂无结果。</p>');
      let h = '<p><b>易经是什么：</b>《周易》64 卦，每卦有卦辞（总括）与六条爻辞（各爻提示）。起卦得"本卦"，有动爻时变出"变卦"，古人借此"观象玩辞"给处境以启发。</p>';
      h += '<p><b>你抽到的卦：</b>本卦「' + r.ben.name + '」（上' + r.ben.up + ' 下' + r.ben.down + '）。卦辞大意：' + r.ben.gua + '。</p>';
      if (r.dongPositions && r.dongPositions.length) {
        h += '<p><b>动爻与变卦：</b>有 ' + r.dongPositions.length + ' 个动爻（标○/×），动爻爻辞是断卦关键（见"动爻断语"）；变卦「' + (r.bian ? r.bian.name : '—') + '」提示事态可能走向。</p>';
      } else {
        h += '<p><b>动爻：</b>本卦无动爻（静卦），以卦辞与全卦意象整体参看。</p>';
      }
      h += '<p><b>大白话：</b>把"一卦"理解成一种"人生处境的比喻"，卦辞爻辞是古人攒下的经验诗，帮你换个角度反思当下，不是预言，也不决定未来。</p>';
      h += tip();
      return wrap('白话文讲解（通俗解读）', h);
    },

    // ===== 紫微斗数 =====
    ziwei: function (r) {
      if (!r) return wrap('白话文讲解（通俗解读）', '<p>暂无结果。</p>');
      const g = (name) => (r.gongs || []).find(x => x.name === name) || { stars: [], hua: [], zhi: '—' };
      const mg = g('命宫'), cb = g('财帛宫'), gl = g('官禄宫'), fq = g('夫妻宫');
      const starTxt = (x) => x.stars.length ? x.stars.join('、') : '（该宫无主星，借对宫星情参看）';
      const s = r.sihua || {};
      let h = '<p><b>紫微斗数是什么：</b>它把人一生分成"十二个面向"——命宫（你是谁）、兄弟、夫妻、子女、财帛（怎么赚钱）、疾厄（健康）、迁移、交友、官禄（事业）、田宅、福德、父母——排进十二个地支宫，看每宫落了哪些"星"，再用"四化"（化禄/权/科/忌）看哪里被加强、哪里被纠结。简单说，就是一张你人生的"雷达图"。</p>';
      h += '<p><b>你的核心格局：</b>命宫在『' + (r.mingGong ? r.mingGong.zhi : '—') + '宫』——这是你给人的第一印象与核心性格；身宫在『' + (r.shenGong ? r.shenGong.zhi : '—') + '宫（' + (r.shenGong ? r.shenGong.name : '') + '）』——是后天最用力、最见成果的地方；五行局为『' + (r.juName || '—') + '』；代表格局核心的"帝星"紫微在『' + (r.ziweiZhi || '—') + '宫』（天府在对宫『' + (r.tianfuZhi || '—') + '宫』）。</p>';
      h += '<p><b>几个关键宫怎么看：</b>① 命宫：' + starTxt(mg) + '——决定你的底色性格；② 财帛宫：' + starTxt(cb) + '——你赚钱的方式与财运倾向；③ 官禄宫：' + starTxt(gl) + '——事业赛道与表现；④ 夫妻宫：' + starTxt(fq) + '——感情相处模式。星曜越多、越吉（如紫微、天府、太阳、武曲等），该领域通常越有发挥空间。</p>';
      h += '<p><b>四化提示：</b>化禄落在「' + (s.禄 || '—') + '」→ 这里易有好事、人缘或收获；化权在「' + (s.权 || '—') + '」→ 此处有掌控力、要主动争取；化科在「' + (s.科 || '—') + '」→ 名声、贵人、化解；化忌在「' + (s.忌 || '—') + '」→ 这里易纠结、卡顿，需多花心思经营。</p>';
      h += (r.timeGZ ? '' : '<p class="warn">⚠ 你未填出生时辰，命宫按"子时"近似，身宫/对宫等论断会偏，仅作娱乐参考。</p>');
      h += tip();
      return wrap('白话文讲解（通俗解读）', h);
    },

    // ===== 生肖 =====
    shengxiao: function (r) {
      if (!r) return wrap('白话文讲解（通俗解读）', '<p>暂无结果。</p>');
      const he = [];
      (r.sanHe || []).forEach(x => he.push(x.shengxiao));
      (r.liuHe || []).forEach(x => he.push(x.shengxiao));
      const chong = (r.liuChong || []).map(x => x.shengxiao);
      let h = '<p><b>生肖是什么：</b>十二生肖是十二地支对应的动物，按"立春"分界（不是春节）。你属 <b>' + r.shengxiao + '</b>（地支 ' + r.yearZhi + '）。</p>';
      h += '<p><b>合与不合：</b>与你合得来的——三合（贵人）' + (r.sanHe || []).length + ' 个、六合（良配）' + (r.liuHe || []).length + ' 个（如 ' + he.join('、') + '）；需留意的——六冲 ' + chong.join('、') + ((r.liuHai && r.liuHai.length) ? '、六害 ' + r.liuHai.map(x => x.shengxiao).join('、') : '') + '。</p>';
      if (r.benmingYears && r.benmingYears.length) h += '<p><b>本命年：</b>' + r.benmingYears.join('、') + ' 等为本命年（值太岁），民俗认为宜低调稳守。</p>';
      if (r.taiSuiYears && r.taiSuiYears.length) h += '<p><b>犯太岁年份：</b>' + r.taiSuiYears.map(t => t.year + '年(' + t.type + ')').join('、') + '，传统上建议谨慎。</p>';
      h += '<p class="tip">属相合冲是民俗概率说法：合则多助、冲则多磨，但真实关系看人不是看属相。本工具仅供娱乐参考。</p>';
      return wrap('白话文讲解（通俗解读）', h);
    },

    // ===== 星座 =====
    xingzuo: function (r) {
      if (!r) return wrap('白话文讲解（通俗解读）', '<p>暂无结果。</p>');
      let h = '<p><b>星座是什么：</b>按公历出生日期划分的 12 个"太阳星座"，源于西方占星，是大众熟悉的一种性格分类游戏。</p>';
      h += '<p><b>你的星座：</b>' + r.name + '（' + r.en + '），出生 ' + r.month + ' 月 ' + r.day + ' 日。</p>';
      h += '<p><b>性格特质：</b>' + r.traits + '（这是该星座的"典型标签"，描述一类人，不等于你个人的判决书。）</p>';
      h += '<p><b>年度运势：</b>' + r.fortune + '——按星座气质的普适解读，绝不等于预言。</p>';
      h += '<p class="tip">星座无科学依据，当趣味了解即可，别让标签定义自己。本工具仅供娱乐。</p>';
      return wrap('白话文讲解（通俗解读）', h);
    },

    // ===== 姓名 =====
    xingming: function (r) {
      if (!r) return wrap('白话文讲解（通俗解读）', '<p>暂无结果。</p>');
      let h = '<p><b>姓名五格是什么：</b>把姓名笔画算成"天格/人格/地格/外格/总格"五个数，配 1–81 的吉凶数理；再看天/人/地三才（五行）生克，判断名字"气场"。</p>';
      if (r.hasAll) {
        const g = r.grids;
        h += '<p><b>你的名字「' + r.name + '」：</b>人格（主运）' + g.ren.value + '（' + g.ren.ji + '）、总格（晚运）' + g.zong.value + '（' + g.zong.ji + '）、天格 ' + g.tian.value + '、地格 ' + g.di.value + '、外格 ' + g.wai.value + '。</p>';
        if (r.sancai) h += '<p><b>三才配置：</b>天 ' + r.sancai.tian + ' ｜ 人 ' + r.sancai.ren + ' ｜ 地 ' + r.sancai.di + ' → 判定「' + r.sancai.verdict + '」。' + (r.sancai.reason || '') + '</p>';
        if (r.xiNote) h += '<p>' + r.xiNote + '</p>';
      } else if (r.missing && r.missing.length) {
        h += '<p>因「' + r.missing.join('、') + '」未收录笔画表，五格与三才暂未计算。</p>';
      }
      h += '<p class="tip">好名字数理吉、三才是"加分项"，但不决定命运——性格、努力与机遇才是关键。本工具仅供娱乐参考。</p>';
      return wrap('白话文讲解（通俗解读）', h);
    },

    // ===== 生日 / 生命灵数 =====
    shengri: function (r) {
      if (!r) return wrap('白话文讲解（通俗解读）', '<p>暂无结果。</p>');
      let h = '<p><b>生命灵数/生日密码是什么：</b>西方数字命理学（numerology）玩法——把生日数字逐位相加归结到 1–9（11/22/33 称"大师数"），描述性格与人生课题。</p>';
      h += '<p><b>你的生命灵数：</b>' + r.lifeNumber + ([11, 22, 33].indexOf(r.lifeNumber) >= 0 ? '（大师数）' : '') + '。' + r.lifeText + '</p>';
      h += '<p><b>生日密码：</b>生日数 ' + r.birthdayNumber + '。' + r.birthdayText + '</p>';
      if (r.challenges && r.challenges.length) h += '<p><b>人生挑战数：</b>' + r.challenges.map(c => c.name + '（' + c.value + '）').join('、') + '——传统上认为需要修炼的"课题"。</p>';
      h += '<p class="tip">数字不决定性格，纯属趣味。本工具仅供娱乐参考。</p>';
      return wrap('白话文讲解（通俗解读）', h);
    },

    // ===== 风水 · 当日黄历 =====
    fengshuiDay: function (r) {
      if (!r) return wrap('白话文讲解（通俗解读）', '<p>暂无结果。</p>');
      let h = '<p><b>黄历/择日是什么：</b>古人按干支、节气、十二建除和神煞给每天标注"宜忌"，用来挑日子。是一套经验性民俗日历，不是科学定律。</p>';
      h += '<p><b>这一天（' + r.solarText + '）：</b>十二建除「' + r.zhiXing + '」——' + r.zhiXingInfo.desc + '；值日神「' + r.tianShen + '」，属' + (r.isHuangDao ? '黄道（传统认为较吉）' : '黑道（传统认为宜静不宜动）') + '。' + (r.tianShenDesc || '') + '</p>';
      h += '<p><b>冲煞：</b>冲 ' + r.chong + '（' + r.chongShengXiao + '），煞' + r.sha + '。属 ' + r.chongShengXiao + ' 的朋友这天民俗上宜谨慎。</p>';
      h += '<p><b>宜忌：</b>宜 ' + (r.yi.length ? r.yi.join('、') : '（无特别）') + '；忌 ' + (r.ji.length ? r.ji.join('、') : '（无特别）') + '。彭祖百忌："' + r.pengZu + '"。</p>';
      h += '<p class="tip">择日看的是概率性民俗偏好，重要日程请结合自身情况判断。本工具仅供娱乐参考。</p>';
      return wrap('白话文讲解（通俗解读）', h);
    },

    // ===== 风水 · 择日 =====
    fengshuiSelect: function (r) {
      if (!r) return wrap('白话文讲解（通俗解读）', '<p>暂无结果。</p>');
      let h = '<p><b>简易择日逻辑：</b>本工具从所选日期起 120 天内，按"宜含该事项、避开「破」日、优先黄道与吉利建除"筛出一批候选吉日。</p>';
      h += '<p><b>结果：</b>' + (r.list && r.list.length ? ('共 ' + r.list.length + ' 个候选（见上表），如 ' + r.list[0].date + ' 等，可结合个人生肖冲煞再择。') : '未筛出合适日期，可放宽事项或更换起始日。') + '</p>';
      h += '<p class="tip">择日为民俗参考，不是"吉日就万事大吉"，重大安排请综合判断。本工具仅供娱乐。</p>';
      return wrap('白话文讲解（通俗解读）', h);
    },

    // ===== 解梦 =====
    jiemeng: function (r) {
      if (!r) return wrap('白话文讲解（通俗解读）', '<p>暂无结果。</p>');
      let h = '<p><b>梦怎么理解：</b>梦是睡眠中大脑活动的产物。现代心理学认为梦多反映近期情绪、压力与经历，没有统一"标准答案"——同一梦境对不同人含义不同。</p>';
      h += '<p><b>你梦到：</b>「' + (r.keyword || '') + '」' + (r.cleaned ? '（提取关键词：' + r.cleaned + '）' : '') + '，匹配到 <b>' + (r.generic ? '通用' : r.count) + '</b> 条解读。</p>';
      if (!r.generic && r.results && r.results.length) {
        h += '<p>常见视角举例：' + r.results.slice(0, 3).map(x => '「' + x.word + '」' + x.meaning).join('；') + '。</p>';
        h += '<p>比如"掉牙"常被理解为对失控/变故的焦虑，"飞"代表渴望自由突破，"蛇"可指隐忧或转变——这都是"可能的解读"，不是定论。</p>';
      } else if (r.genericText) {
        h += '<p>' + r.genericText + '</p>';
      }
      h += '<p class="tip">解梦没有标准答案，别对号入座、更别因此焦虑。本工具仅供娱乐与自我觉察参考。</p>';
      return wrap('白话文讲解（通俗解读）', h);
    },

    // ===== 测字 =====
    cezi: function (r) {
      if (!r) return wrap('白话文讲解（通俗解读）', '<p>暂无结果。</p>');
      let h = '<p><b>测字是什么：</b>古人把汉字拆开（看结构、部首、笔画）、取意象与谐音来占卜，是文人的文字游戏，属于"术"的趣味，不是真能算命。</p>';
      h += '<p><b>「' + r.char + '」字拆解：</b>结构 ' + r.struct + (r.structDesc ? '（' + r.structDesc + '）' : '') + '，部首 ' + r.radical + '，' + r.strokes + ' 画，五行属 ' + r.wuxing + '，字义"' + r.meaning + '"，谐音可联想「' + r.homo + '」。</p>';
      h += '<p><b>占断倾向：</b>' + r.tendency + '。下方"创意占断"是"信则有"的联想文本，纯属娱乐。</p>';
      h += '<p class="tip">测字是文字游戏，切勿当真。本工具仅供娱乐参考。</p>';
      return wrap('白话文讲解（通俗解读）', h);
    },

    // ===== 面相 =====
    mianxiang: function (r) {
      if (!r) return wrap('白话文讲解（通俗解读）', '<p>暂无结果。</p>');
      let h = '<p><b>相学是什么：</b>通过观察五官、手纹、痣位等特征推测气质与性格倾向，是传统经验性观察，并非科学。</p>';
      h += '<p><b>你的报告：</b>共勾选 ' + r.count + ' 个部位，上方已按组给出每处形态解读与综合建议。相不独论——单看一处意义有限，要结合整体气质看。</p>';
      h += '<p><b>大白话：</b>这些解读更像"气质印象"（如眉清目秀给人好感、鼻挺观感上主财运），不是命运判决。自信与修养比面相更重要。</p>';
      h += '<p class="tip">相学仅供娱乐参考，理性看待，切勿以貌取人、也别因"相"焦虑。本工具仅供娱乐。</p>';
      return wrap('白话文讲解（通俗解读）', h);
    },

    // ===== 前世今生 =====
    qianshi: function (r) {
      if (!r) return wrap('白话文讲解（通俗解读）', '<p>暂无结果。</p>');
      let h = '<p><b>先说清楚：</b>本模块是纯创意娱乐。它用你输入的生日/姓名作"种子"生成一段虚构"前世"故事，结果稳定可复现，但<b>纯属编造</b>，不代表任何轮回观或宗教主张。</p>';
      h += '<p><b>你的"前世档案"：</b>' + r.era + ' 的「' + r.identity + '」，性情' + r.trait + '，结局' + r.fate + '，契合指数 ' + r.score + '/100（娱乐分值）。</p>';
      h += '<p><b>故事与联系：</b>上方"前世故事""与今生的联系"都是拼出来的创意文本，当一段小故事看就好，别往自己身上硬套。</p>';
      h += '<p class="tip">纯属虚构娱乐，不可当真。本工具仅供消遣。</p>';
      return wrap('白话文讲解（通俗解读）', h);
    },

    // ===== 流年 =====
    liunian: function (r) {
      if (!r) return wrap('白话文讲解（通俗解读）', '<p>暂无结果。</p>');
      let h = '<p><b>大运/流年是什么：</b>八字以"十年一大运"管人生某阶段基调，以"一年一流动"管当年波动。大运如季节，流年如天气。</p>';
      h += '<p><b>你的起运：</b>约 <b>' + r.startAge + ' 岁</b>起运（' + r.jieText + '）。上方"大运排盘"列出每步大运的干支与起止年龄。</p>';
      h += '<p><b>流年怎么看：</b>逐年表中"天干对日主"表示当年能量对你有利与否——生扶日主之年多顺，克制日主之年多磨；标"犯太岁/日支×"的年份，传统上建议低调稳守。下方"逐年解读"已展开。</p>';
      h += '<p class="tip">运势是概率性参考，不是宿命。顺势而为、踏实努力才是关键。本工具仅供娱乐参考。</p>';
      return wrap('白话文讲解（通俗解读）', h);
    },

    // ===== 合婚 =====
    hemwei: function (r) {
      if (!r) return wrap('白话文讲解（通俗解读）', '<p>暂无结果。</p>');
      let h = '<p><b>八字合婚看什么：</b>传统合婚综合"生肖、日干、日支、五行互补、十神互补、星座"等维度，给一对人打契合度分数。</p>';
      h += '<p><b>你俩的综合评分：</b><b>' + r.score + ' / 100</b>（' + r.grade + '）。上方"合婚要点"列出各维度加减分与说明。</p>';
      h += '<p><b>大白话：</b>分数高传统上认为较合拍；分数低也不代表不能在一起。感情真正靠相处、沟通、三观与共同经营——这些分数算不出来。</p>';
      h += '<p class="tip">合婚分数仅供娱乐参考，别让一个数字定义一段关系。本工具仅供娱乐。</p>';
      return wrap('白话文讲解（通俗解读）', h);
    },

    // ===== 数字能量 =====
    shuzi: function (r) {
      if (!r) return wrap('白话文讲解（通俗解读）', '<p>暂无结果。</p>');
      let h = '<p><b>数字能量是什么：</b>把手机号/车牌等数字串从右往左两两分组，按"八星"（伏位、生气、延年、天医、六煞、祸害、五鬼、绝命）判磁场吉凶，是近年流行的民俗说法。</p>';
      h += '<p><b>你的号码：</b>共 ' + r.length + ' 位，吉星 <b>' + r.count.ji + '</b>、凶星 <b>' + r.count.xiong + '</b>、平 ' + r.count.ping + '。尾号组 ' + (r.tailGroup ? r.tailGroup.pair + '（' + r.tailGroup.star + '·' + r.tailGroup.level + '）' : '—') + ' 影响最大。下方已逐组解读。</p>';
      h += '<p><b>大白话：</b>这是"趣味联想"——数字和运气之间没有因果联系。别花冤枉钱"换靓号改运"，好运气靠自己经营。</p>';
      h += '<p class="tip">数字能量仅供娱乐参考，切勿迷信。本工具仅供娱乐。</p>';
      return wrap('白话文讲解（通俗解读）', h);
    }
  };
})();
