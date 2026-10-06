const base = window.LIVE2D_BASE || '/live2d/';

/* 与上游逐字节相同的运行时改指 jsdelivr 上钉死的 commit（判据 _tmp/roundR_cdn_cmp.txt）；
   被本站改过的 waifu-tips.js、chunk/index.js 仍在本地。 */
const LIVE2D_CDN = 'https://cdn.jsdelivr.net/gh/stevenjoezhang/live2d-widget@34b27cc8bcbac20e56344429e890b9bad885d002';

await import(base + 'dist/waifu-tips.js');

const widget = {
  waifuPath: base + 'waifu-tips.json',
  cubism2Path: LIVE2D_CDN + '/dist/live2d.min.js',
  tools: ['hitokoto', 'photo', 'info', 'quit'],
  drag: true,
  logLevel: 'warn'
};

window.initWidget(widget);

const tips = await (await fetch(widget.waifuPath)).json();
const one = t => Array.isArray(t) ? t[Math.floor(Math.random() * t.length)] : t;
const atHour = h => (tips.time || []).find(r => {
  const sp = String(r.hour).split('-');
  return Number(sp[0]) <= h && h <= Number(sp[1] || sp[0]);
});

let spoken = new Date().getHours();
const chime = () => {
  const h = new Date().getHours();
  if (h === spoken || !document.getElementById('waifu-tips') || typeof window.waifuShowTip !== 'function') return;
  const row = atHour(h);
  if (!row) return;
  spoken = h;
  const head = String(one(tips.message && tips.message.hourly) || '').split('{hour}').join(String(h));
  window.waifuShowTip(head + one(row.text), 6000, 11);
};

setInterval(chime, 30000);
