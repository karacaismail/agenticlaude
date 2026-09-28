import { useEffect, useRef } from 'react';
import * as echarts from 'echarts/core';
import { BarChart, HeatmapChart } from 'echarts/charts';
import { GridComponent, TooltipComponent, LegendComponent, VisualMapComponent, AriaComponent } from 'echarts/components';
import { SVGRenderer } from 'echarts/renderers';
import type { EChartsOption } from 'echarts';

echarts.use([BarChart, HeatmapChart, GridComponent, TooltipComponent, LegendComponent, VisualMapComponent, AriaComponent, SVGRenderer]);

// SVG çizici: yazdırmada keskin kalır.
export function EGrafik({ secenek, yukseklik = 320, etiket }: { secenek: EChartsOption; yukseklik?: number; etiket: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const grafik = useRef<ReturnType<typeof echarts.init> | null>(null);
  useEffect(() => {
    if (!ref.current) return;
    const g = echarts.init(ref.current, undefined, { renderer: 'svg' });
    grafik.current = g;
    const ro = new ResizeObserver(() => g.resize());
    ro.observe(ref.current);
    return () => { ro.disconnect(); g.dispose(); grafik.current = null; };
  }, []);
  useEffect(() => { grafik.current?.setOption(secenek, true); }, [secenek]);
  return <div ref={ref} style={{ width: '100%', height: yukseklik }} role="img" aria-label={etiket} />;
}
