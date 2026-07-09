/*
 * svg.js — 玄学通鉴可视化组件库（window.SVGKit）
 * 纯 SVG 生成，无依赖；返回 HTML 字符串，可直接 innerHTML / append。
 * 配色沿用国风主题：墨底、金 #c9a86a、朱砂 #b03a2e。
 */
(function (root) {
  'use strict';
  const GOLD = '#c9a86a';
  const CINNABAR = '#b03a2e';
  const INK = '#e9e2d0';
  const WUXING_COLORS = { 木: '#5b8c5a', 火: '#c0392b', 土: '#b9770e', 金: '#cfd6d8', 水: '#2e6f95' };

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  }
  function card(title, inner) {
    return '<div class="card svg-card"><div class="card-title">' + esc(title) +
      '</div><div class="svg-wrap">' + inner + '</div></div>';
  }
  const rad = d => d * Math.PI / 180;
  const pt = (cx, cy, r, deg) => [cx + r * Math.cos(rad(deg)), cy + r * Math.sin(rad(deg))];

  // —— 紫微十二宫盘（命宫起，顺时针排十二宫）——
  function ziweiChart(gongs, mingGong, shenGong) {
    if (!gongs || !gongs.length) return '';
    const cx = 210, cy = 210, rO = 196, rI = 74, N = 12;
    let s = '<svg class="svg-chart" viewBox="0 0 420 420" role="img" aria-label="紫微十二宫命盘">';
    s += '<circle cx="' + cx + '" cy="' + cy + '" r="' + rI + '" fill="#211a10" stroke="' + GOLD + '" stroke-width="1.5"/>';
    s += '<text x="' + cx + '" y="' + (cy - 6) + '" text-anchor="middle" fill="' + GOLD + '" font-size="16" font-family="serif">' + esc(mingGong ? mingGong.zhi : '') + '</text>';
    s += '<text x="' + cx + '" y="' + (cy + 14) + '" text-anchor="middle" fill="' + INK + '" font-size="12">命宫</text>';
    if (shenGong) s += '<text x="' + cx + '" y="' + (cy + 30) + '" text-anchor="middle" fill="' + INK + '" font-size="10" opacity="0.8">身宫·' + esc(shenGong.zhi) + '</text>';
    for (let i = 0; i < N; i++) {
      const g = gongs[i];
      const a0 = -90 + i * 30, a1 = -90 + (i + 1) * 30, am = (a0 + a1) / 2;
      const [sx, sy] = pt(cx, cy, rO, a0), [ex, ey] = pt(cx, cy, rO, a1), [ix, iy] = pt(cx, cy, rI, a1), [jx, jy] = pt(cx, cy, rI, a0);
      const isMing = g.name === '命宫';
      const fill = i % 2 ? '#1a150d' : '#201a10';
      s += '<path d="M' + sx + ' ' + sy + ' A' + rO + ' ' + rO + ' 0 0 1 ' + ex + ' ' + ey +
        ' L' + ix + ' ' + iy + ' A' + rI + ' ' + rI + ' 0 0 0 ' + jx + ' ' + jy + ' Z" fill="' + fill +
        '" stroke="' + (isMing ? CINNABAR : GOLD) + '" stroke-width="' + (isMing ? 2 : 0.8) + '"/>';
      const [nx, ny] = pt(cx, cy, (rI + rO) / 2 - 32, am);
      s += '<text x="' + nx + '" y="' + ny + '" text-anchor="middle" fill="' + (isMing ? CINNABAR : GOLD) +
        '" font-size="13" font-family="serif" font-weight="700">' + esc(g.name) + '</text>';
      const stars = (g.stars || []).slice(0, 3);
      stars.forEach((st, k) => {
        const [tx, ty] = pt(cx, cy, (rI + rO) / 2 + 4 + k * 13, am);
        s += '<text x="' + tx + '" y="' + ty + '" text-anchor="middle" fill="' + INK + '" font-size="10">' + esc(st) + '</text>';
      });
      if (g.hua && g.hua.length) {
        const [hx, hy] = pt(cx, cy, (rI + rO) / 2 + 4 + stars.length * 13, am);
        s += '<text x="' + hx + '" y="' + hy + '" text-anchor="middle" fill="' + CINNABAR + '" font-size="9">' + esc(g.hua.join(' ')) + '</text>';
      }
    }
    s += '</svg>';
    return card('紫微十二宫命盘', s);
  }

  // —— 八字五行分布（柱状）——
  function baziWuxing(totalWu, dayW, strength) {
    const order = ['木', '火', '土', '金', '水'];
    const max = Math.max(1, ...order.map(w => (totalWu && totalWu[w]) || 0));
    const W = 320, H = 170, pad = 34, bw = 38, gap = 16;
    let s = '<svg class="svg-chart" viewBox="0 0 ' + W + ' ' + (H + 34) + '" role="img" aria-label="五行分布">';
    s += '<text x="' + (W / 2) + '" y="14" text-anchor="middle" fill="' + GOLD + '" font-size="11">日主强弱：' + esc(strength || '') + '</text>';
    order.forEach((w, i) => {
      const v = (totalWu && totalWu[w]) || 0;
      const x = pad + i * (bw + gap);
      const bh = (v / max) * (H - 46);
      const y = H - bh - 16;
      const col = WUXING_COLORS[w];
      const isDay = w === dayW;
      s += '<rect x="' + x + '" y="' + y + '" width="' + bw + '" height="' + Math.max(bh, 0) + '" rx="3" fill="' + col +
        '" fill-opacity="' + (isDay ? 0.95 : 0.55) + '" stroke="' + (isDay ? CINNABAR : GOLD) + '" stroke-width="' + (isDay ? 2 : 0.8) + '"/>';
      s += '<text x="' + (x + bw / 2) + '" y="' + (y - 5) + '" text-anchor="middle" fill="' + INK + '" font-size="13">' + v + '</text>';
      s += '<text x="' + (x + bw / 2) + '" y="' + (H + 2) + '" text-anchor="middle" fill="' + (isDay ? CINNABAR : GOLD) + '" font-size="12" font-family="serif">' + esc(w) + (isDay ? '(日主)' : '') + '</text>';
    });
    s += '</svg>';
    return card('五行分布', s);
  }

  // —— 易经卦象（本卦 + 变卦，初爻在底）——
  function yijingGua(lines, benName, bianName) {
    if (!lines || !lines.length) return '';
    const W = 300, lh = 22, pad = 34, topBen = 24, topBian = topBen + 6 * lh + 28;
    let s = '<svg class="svg-chart" viewBox="0 0 ' + W + ' ' + (topBian + 6 * lh + 28) + '" role="img" aria-label="易经卦象">';
    s += '<text x="' + (W / 2) + '" y="14" text-anchor="middle" fill="' + GOLD + '" font-size="12">本卦：' + esc(benName || '') + '</text>';
    for (let i = 0; i < lines.length; i++) {
      const ln = lines[i];
      const y = topBen + (lines.length - 1 - i) * lh + 10;
      if (ln.yang) {
        s += '<rect x="' + pad + '" y="' + y + '" width="' + (W - 2 * pad) + '" height="8" fill="' + (ln.dong ? CINNABAR : GOLD) + '" rx="2"/>';
      } else {
        const mid = (W - 2 * pad) / 2;
        s += '<rect x="' + pad + '" y="' + y + '" width="' + (mid - 6) + '" height="8" fill="' + (ln.dong ? CINNABAR : GOLD) + '" rx="2"/>';
        s += '<rect x="' + (pad + mid + 6) + '" y="' + y + '" width="' + (mid - 6) + '" height="8" fill="' + (ln.dong ? CINNABAR : GOLD) + '" rx="2"/>';
      }
      if (ln.dong) s += '<text x="' + (W - pad + 8) + '" y="' + (y + 8) + '" fill="' + CINNABAR + '" font-size="11">动</text>';
    }
    if (bianName) {
      s += '<text x="' + (W / 2) + '" y="' + (topBian - 8) + '" text-anchor="middle" fill="' + GOLD + '" font-size="12">变卦：' + esc(bianName) + '</text>';
      for (let i = 0; i < lines.length; i++) {
        const ln = lines[i];
        const y = topBian + (lines.length - 1 - i) * lh + 10;
        const yang2 = ln.dong ? (ln.yang ? 0 : 1) : ln.yang;
        if (yang2) {
          s += '<rect x="' + pad + '" y="' + y + '" width="' + (W - 2 * pad) + '" height="8" fill="' + GOLD + '" fill-opacity="0.55" rx="2"/>';
        } else {
          const mid = (W - 2 * pad) / 2;
          s += '<rect x="' + pad + '" y="' + y + '" width="' + (mid - 6) + '" height="8" fill="' + GOLD + '" fill-opacity="0.55" rx="2"/>';
          s += '<rect x="' + (pad + mid + 6) + '" y="' + y + '" width="' + (mid - 6) + '" height="8" fill="' + GOLD + '" fill-opacity="0.55" rx="2"/>';
        }
      }
    }
    s += '</svg>';
    return card('易经卦象', s);
  }

  // —— 奇门遁甲九宫格（洛书方位）——
  function qimenGrid(cells, ju, yinText) {
    if (!cells || !cells.length) return '';
    const map = { 4: [0, 0], 9: [0, 1], 2: [0, 2], 3: [1, 0], 5: [1, 1], 7: [1, 2], 8: [2, 0], 1: [2, 1], 6: [2, 2] };
    const S = 336, cell = 104, gap = 4, ox = 6, oy = 24;
    let s = '<svg class="svg-chart" viewBox="0 0 ' + S + ' ' + (S + 22) + '" role="img" aria-label="奇门九宫">';
    s += '<text x="' + (S / 2) + '" y="16" text-anchor="middle" fill="' + GOLD + '" font-size="12">' + esc(yinText || '') + ' · ' + esc(ju) + ' 局</text>';
    cells.forEach(c => {
      const pos = map[c.gong] || [1, 1];
      const x = ox + pos[1] * (cell + gap), y = oy + pos[0] * (cell + gap);
      const hl = c.isValueStar || c.isZhiShi;
      s += '<rect x="' + x + '" y="' + y + '" width="' + cell + '" height="' + cell + '" rx="4" fill="' + (c.gong === 5 ? '#241a0e' : '#1a150d') + '" stroke="' + (hl ? CINNABAR : GOLD) + '" stroke-width="' + (hl ? 2 : 0.8) + '"/>';
      s += '<text x="' + (x + 7) + '" y="' + (y + 15) + '" fill="' + GOLD + '" font-size="11">' + c.gong + '</text>';
      s += '<text x="' + (x + cell - 7) + '" y="' + (y + 15) + '" text-anchor="end" fill="' + INK + '" font-size="9" opacity="0.85">' + esc(c.dir || '') + '</text>';
      s += '<text x="' + (x + 7) + '" y="' + (y + 32) + '" fill="' + INK + '" font-size="11">地 ' + esc(c.di || '') + '</text>';
      s += '<text x="' + (x + 7) + '" y="' + (y + 49) + '" fill="' + (c.isValueStar ? CINNABAR : INK) + '" font-size="11" font-weight="700">' + esc(c.tian || '') + '</text>';
      s += '<text x="' + (x + 7) + '" y="' + (y + 66) + '" fill="' + (c.isZhiShi ? CINNABAR : INK) + '" font-size="11">' + esc(c.men || '') + '</text>';
      if (c.shen) s += '<text x="' + (x + 7) + '" y="' + (y + 82) + '" fill="' + INK + '" font-size="10" opacity="0.85">' + esc(c.shen) + '</text>';
    });
    s += '</svg>';
    return card('奇门遁甲九宫盘', s);
  }

  root.SVGKit = { ziweiChart, baziWuxing, yijingGua, qimenGrid };
})(typeof window !== 'undefined' ? window : this);
