import type { YerlesikNot } from './uretec';
import { NOT_TURU } from '../veri/notlar';

// FigJam tarzı yapışkan notlar: Mermaid SVG'si çizildikten sonra notlar SVG'nin sağına,
// hedef düğümün hizasına yerleştirilir ve kesik çizgiyle bağlanır. SVG ile birlikte ölçeklenir
// ve yazdırılır (PDF'te de görünür).
const NS = 'http://www.w3.org/2000/svg';
const GENISLIK = 230;
const BOSLUK = 56;
const SATIR = 16;

function sar(metin: string, enFazla = 32): string[] {
  const kelimeler = metin.split(/\s+/);
  const satirlar: string[] = [];
  let s = '';
  for (const k of kelimeler) {
    if ((s + ' ' + k).trim().length > enFazla && s) { satirlar.push(s); s = k; } else s = (s + ' ' + k).trim();
  }
  if (s) satirlar.push(s);
  return satirlar;
}

function el<K extends keyof SVGElementTagNameMap>(ad: K, oz: Record<string, string | number>): SVGElementTagNameMap[K] {
  const e = document.createElementNS(NS, ad);
  for (const [k, v] of Object.entries(oz)) e.setAttribute(k, String(v));
  return e;
}

export function notlariYapistir(svg: SVGSVGElement, notlar: YerlesikNot[]) {
  svg.querySelectorAll('.yapiskan-katman').forEach((n) => n.remove());
  if (!notlar.length) return;
  const vb = svg.viewBox.baseVal;
  if (!vb || !vb.width) return;
  const kokCtm = svg.getScreenCTM();
  if (!kokCtm) return;
  const ters = kokCtm.inverse();

  // Hedef düğümlerin SVG koordinatındaki kutuları
  const kutu = (hedef: string) => {
    // Mermaid 11 kimliği çizim kimliğiyle başlatır: <çizim>-flowchart-<düğüm>-<sıra>
    const g = svg.querySelector<SVGGElement>(`g.node[id*="-flowchart-${hedef}-"], g.node[id^="flowchart-${hedef}-"]`);
    if (!g) return null;
    const b = g.getBBox();
    const m = g.getScreenCTM();
    if (!m) return null;
    const p1 = new DOMPoint(b.x, b.y).matrixTransform(m).matrixTransform(ters);
    const p2 = new DOMPoint(b.x + b.width, b.y + b.height).matrixTransform(m).matrixTransform(ters);
    return { x: p1.x, y: p1.y, sag: p2.x, alt: p2.y, orta: (p1.y + p2.y) / 2 };
  };

  const yerlesim = notlar
    .map((n) => ({ n, k: kutu(n.hedef) }))
    .filter((x): x is { n: YerlesikNot; k: NonNullable<ReturnType<typeof kutu>> } => !!x.k)
    .sort((a, b) => a.k.orta - b.k.orta);
  if (!yerlesim.length) return;

  const katman = el('g', { class: 'yapiskan-katman' });
  const solX = vb.x + vb.width + BOSLUK;
  let altSinir = vb.y;
  const tanimlar = el('defs', {});
  const golge = el('filter', { id: `golge-${Math.random().toString(36).slice(2, 7)}`, x: '-10%', y: '-10%', width: '130%', height: '140%' });
  golge.appendChild(el('feDropShadow', { dx: 1.5, dy: 2.5, stdDeviation: 1.6, 'flood-color': '#000', 'flood-opacity': 0.18 }));
  tanimlar.appendChild(golge);
  katman.appendChild(tanimlar);

  yerlesim.forEach(({ n, k }, i) => {
    const tur = NOT_TURU[n.tur];
    const govde = sar(n.metin);
    const durum = n.durum === 'acik' ? `✓ Önlem açık · ${n.kural}` : n.durum === 'kapali' ? `⚠ Önlem kapalı · ${n.kural}` : 'Bilgi';
    const yukseklik = 14 + 16 + govde.length * SATIR + 8 + 16 + 12;
    let y = Math.max(k.orta - yukseklik / 2, altSinir + 10);
    altSinir = y + yukseklik;
    const x = solX + (i % 2 ? 10 : 0);
    const aci = i % 2 ? 1.2 : -1.2;

    const hedefX = k.sag + 4;
    const baglanti = el('path', {
      d: `M ${hedefX} ${k.orta} C ${hedefX + BOSLUK * 0.6} ${k.orta}, ${x - BOSLUK * 0.6} ${y + yukseklik / 2}, ${x} ${y + yukseklik / 2}`,
      fill: 'none', stroke: n.durum === 'kapali' ? '#e03131' : tur.kenar, 'stroke-width': 1.4, 'stroke-dasharray': '4 3',
    });
    katman.appendChild(baglanti);

    const grup = el('g', { transform: `rotate(${aci} ${x + GENISLIK / 2} ${y + yukseklik / 2})` });
    grup.appendChild(el('rect', {
      x, y, width: GENISLIK, height: yukseklik, rx: 3, fill: tur.dolgu,
      stroke: n.durum === 'kapali' ? '#e03131' : tur.kenar, 'stroke-width': n.durum === 'kapali' ? 2 : 1, filter: `url(#${golge.id})`,
    }));
    const yazi = el('text', { x: x + 12, y: y + 22, 'font-family': 'system-ui, -apple-system, "Segoe UI", sans-serif', 'font-size': 12.5, fill: '#1a1a19' });
    const baslik = el('tspan', { x: x + 12, 'font-weight': 700, 'font-size': 11.5 });
    baslik.textContent = tur.ad.toLocaleUpperCase('tr-TR');
    yazi.appendChild(baslik);
    govde.forEach((s, j) => {
      const t = el('tspan', { x: x + 12, dy: j === 0 ? 20 : SATIR });
      t.textContent = s;
      yazi.appendChild(t);
    });
    const d = el('tspan', { x: x + 12, dy: SATIR + 8, 'font-weight': 700, fill: n.durum === 'kapali' ? '#c92a2a' : n.durum === 'acik' ? '#2b8a3e' : '#495057' });
    d.textContent = durum;
    yazi.appendChild(d);
    const kay = el('tspan', { x: x + 12, dy: SATIR - 2, 'font-size': 10.5, fill: '#52514e' });
    kay.textContent = `Kaynak: ${n.kaynak}`;
    yazi.appendChild(kay);
    grup.appendChild(yazi);
    katman.appendChild(grup);
  });

  svg.appendChild(katman);
  const yeniGenislik = vb.width + BOSLUK + GENISLIK + 30;
  const yeniYukseklik = Math.max(vb.height, altSinir - vb.y + 16);
  svg.setAttribute('viewBox', `${vb.x} ${vb.y} ${yeniGenislik} ${yeniYukseklik}`);
  const mw = svg.style.maxWidth;
  if (mw) svg.style.maxWidth = `${parseFloat(mw) + BOSLUK + GENISLIK + 30}px`;
}
