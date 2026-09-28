import type { EChartsOption } from 'echarts';
import type { GrafikTema } from '../tema';

const ipucu = (g: GrafikTema) => ({
  backgroundColor: g.yuzey, borderColor: g.eksen, borderWidth: 1, textStyle: { color: g.metin, fontSize: 12 },
  extraCssText: 'box-shadow: 0 4px 14px rgba(0,0,0,.12); border-radius: 8px;',
});
const eksenYazi = (g: GrafikTema) => ({ color: g.ikincil, fontSize: 11.5 });

// Tek seri yatay çubuk. Renk = kategorik 1. yuva (her çubuk aynı renk; değer uzunlukla okunur).
export function yatayCubuk(g: GrafikTema, kategoriler: string[], degerler: number[], opt: { birim?: string; renkler?: string[]; etiketGenislik?: number } = {}): EChartsOption {
  return {
    animationDuration: 400,
    grid: { left: 8, right: 44, top: 6, bottom: 6, containLabel: true },
    tooltip: { ...ipucu(g), trigger: 'item', formatter: (p: any) => `${p.name}<br/><b>${p.value}${opt.birim ?? ''}</b>` },
    xAxis: { type: 'value', splitNumber: 4, axisLabel: { color: g.soluk, fontSize: 11, hideOverlap: true }, splitLine: { lineStyle: { color: g.izgara } }, axisLine: { show: false } },
    yAxis: { type: 'category', data: kategoriler, inverse: true, axisTick: { show: false }, axisLine: { lineStyle: { color: g.eksen } }, axisLabel: { ...eksenYazi(g), width: opt.etiketGenislik ?? 230, overflow: 'truncate' } },
    series: [{
      type: 'bar', data: degerler.map((v, i) => ({ value: v, itemStyle: { color: opt.renkler?.[i] ?? g.seri[0] } })), barMaxWidth: 18, barCategoryGap: '34%',
      itemStyle: { borderRadius: [0, 4, 4, 0] },
      label: { show: true, position: 'right', color: g.ikincil, fontSize: 11, formatter: (p: any) => `${p.value}${opt.birim ?? ''}` },
    }],
  };
}

// Yığılmış yatay çubuk: dilimler arasında 2 px yüzey boşluğu.
export function yigilmisYatay(g: GrafikTema, kategoriler: string[], seriler: { ad: string; veri: number[]; renk: string }[], opt: { etiketGenislik?: number } = {}): EChartsOption {
  return {
    animationDuration: 400,
    legend: { top: 0, left: 0, itemWidth: 12, itemHeight: 12, textStyle: { color: g.ikincil, fontSize: 12 }, icon: 'roundRect' },
    grid: { left: 8, right: 24, top: 32, bottom: 6, containLabel: true },
    tooltip: { ...ipucu(g), trigger: 'axis', axisPointer: { type: 'shadow', shadowStyle: { color: 'rgba(137,135,129,0.10)' } } },
    xAxis: { type: 'value', splitNumber: 4, axisLabel: { color: g.soluk, fontSize: 11, hideOverlap: true }, splitLine: { lineStyle: { color: g.izgara } } },
    yAxis: { type: 'category', data: kategoriler, inverse: true, axisTick: { show: false }, axisLine: { lineStyle: { color: g.eksen } }, axisLabel: { ...eksenYazi(g), width: opt.etiketGenislik ?? 230, overflow: 'truncate' } },
    series: seriler.map((s, i) => ({
      name: s.ad, type: 'bar', stack: 'toplam', data: s.veri, barMaxWidth: 18, barCategoryGap: '34%',
      itemStyle: { color: s.renk, borderColor: g.yuzey, borderWidth: 1, borderRadius: i === seriler.length - 1 ? [0, 4, 4, 0] : 0 },
      emphasis: { focus: 'series' },
    })),
  };
}

// Isı haritası: tek renk sıralı ölçek (sıfıra yakın = yüzeye yakın).
export function isiHaritasi(g: GrafikTema, x: string[], y: string[], veri: [number, number, number][]): EChartsOption {
  const enBuyuk = Math.max(1, ...veri.map((v) => v[2]));
  const koyu = g.yuzey !== '#fcfcfb';
  // Açık modda yüksek değer koyu hücre (beyaz yazı); koyu modda tersi.
  const yazi = (v: number) => ((v / enBuyuk > 0.5) !== koyu ? '#ffffff' : '#0b0b0b');
  return {
    animationDuration: 400,
    grid: { left: 8, right: 16, top: 8, bottom: 56, containLabel: true },
    tooltip: { ...ipucu(g), trigger: 'item', formatter: (p: any) => `${x[p.value[0]]} · ${y[p.value[1]]}<br/><b>${p.value[2]} kayıt</b>` },
    xAxis: { type: 'category', data: x, axisLabel: { ...eksenYazi(g), rotate: 30, interval: 0 }, axisTick: { show: false }, axisLine: { lineStyle: { color: g.eksen } }, splitArea: { show: false } },
    yAxis: { type: 'category', data: y, inverse: true, axisLabel: { ...eksenYazi(g), width: 250, overflow: 'truncate' }, axisTick: { show: false }, axisLine: { lineStyle: { color: g.eksen } } },
    visualMap: { min: 0, max: enBuyuk, calculable: false, orient: 'horizontal', left: 'center', bottom: 0, itemWidth: 12, itemHeight: 140, text: [`${enBuyuk}`, '0'], textStyle: { color: g.ikincil, fontSize: 11 }, inRange: { color: g.sirali.slice(0, 11) } },
    series: [{
      type: 'heatmap', data: veri.map((v) => ({ value: v, label: { color: yazi(v[2]) } })), label: { show: true, fontSize: 11, formatter: (p: any) => (p.value[2] ? String(p.value[2]) : '') },
      itemStyle: { borderColor: g.yuzey, borderWidth: 2, borderRadius: 3 },
      emphasis: { itemStyle: { borderColor: g.metin, borderWidth: 1 } },
    }],
  };
}
