/*
 * mianxiang.js — 面相/手相/痣相 核心（纯逻辑，无 DOM 依赖）
 * 依赖：window.MianXiangData（js/data/mianxiang.js）
 * 输入：{ selections:[{ group, key, state }] }   —— 用户勾选的部位及状态
 * 输出：{ count, items:[{ group, groupTitle, name, desc, state, interp }], synthesis }
 */
(function (root, factory) {
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = factory();
  } else {
    root.MianXiang = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  function getData() {
    if (typeof window !== 'undefined' && window.MianXiangData) return window.MianXiangData;
    if (typeof MianXiangData !== 'undefined') return MianXiangData;
    return null;
  }

  function compute(input) {
    const D = getData();
    if (!D) throw new Error('面相数据未加载');
    const sels = (input && input.selections) || [];
    if (!sels.length) return { count: 0, items: [], synthesis: '' };

    const items = sels.map(s => {
      const grp = D.GROUPS[s.group];
      const item = grp && grp.items[s.key];
      if (!item) return null;
      const interp = (item.states[s.state]) || Object.values(item.states)[0];
      return {
        group: s.group, groupTitle: grp.title,
        name: item.name, desc: item.desc,
        state: s.state, interp
      };
    }).filter(Boolean);

    // 综合
    let synthesis = '';
    if (items.length === 1) {
      synthesis = '仅观「' + items[0].name + '」一处，已见一斑；相不独论，建议结合更多部位综合判断。';
    } else {
      synthesis = '综合所观 ' + items.length + ' 处：面相重"五官协调、三停匀称"，手相重"三线清浊"，痣相重"位置得宜"。' +
        '以上各项并非孤立——如额（早年）与鼻（中年）皆佳，则一生运势衔接顺畅；若某处有弱，多可借后天修养与抉择弥补。' +
        '切记相由心生，整体气质与为人更胜于单处形貌。';
    }

    return { count: items.length, items, synthesis };
  }

  return { compute };
});
