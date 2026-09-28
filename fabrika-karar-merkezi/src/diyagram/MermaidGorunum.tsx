import { useEffect, useRef, useState } from 'react';
import { Alert, Loader, Center } from '@mantine/core';
import { ciz } from './mermaid';
import { notlariYapistir } from './yapistir';
import type { YerlesikNot } from './uretec';

// Mermaid kodunu çizer; yapışkan notları SVG'nin içine ekler. Tuval her zaman açık zeminlidir (FigJam gibi).
export function MermaidGorunum({ kod, notlar = [], onSvg, gercek = false }: { kod: string; notlar?: YerlesikNot[]; onSvg?: (svg: string) => void; gercek?: boolean }) {
  const kap = useRef<HTMLDivElement>(null);
  const [hata, setHata] = useState<string | null>(null);
  const [yukleniyor, setYukleniyor] = useState(true);

  useEffect(() => {
    let iptal = false;
    setYukleniyor(true);
    ciz(kod)
      .then((svg) => {
        if (iptal || !kap.current) return;
        kap.current.innerHTML = svg;
        const el = kap.current.querySelector('svg');
        if (el) {
          el.removeAttribute('height');
          notlariYapistir(el as SVGSVGElement, notlar);
          onSvg?.(el.outerHTML);
        }
        setHata(null);
      })
      .catch((e: unknown) => { if (!iptal) setHata(e instanceof Error ? e.message : String(e)); })
      .finally(() => { if (!iptal) setYukleniyor(false); });
    return () => { iptal = true; };
    // notlar dizisi her çizimde yeni oluşur; içeriğine göre yeniden çiz
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kod, JSON.stringify(notlar)]);

  // Gerçek boyut: SVG, viewBox genişliğinde çizilir; tuval yatay kaydırılır.
  useEffect(() => {
    const el = kap.current?.querySelector('svg') as SVGSVGElement | null;
    if (!el) return;
    const vb = el.viewBox?.baseVal;
    el.style.width = gercek && vb?.width ? `${Math.round(vb.width)}px` : '';
  }, [gercek, yukleniyor]);

  return (
    <div className={`tuval${gercek ? ' gercek' : ''}`}>
      {yukleniyor && <Center py="xl"><Loader size="sm" /></Center>}
      {hata && <Alert color="red" title="Diyagram çizilemedi">{hata}</Alert>}
      <div ref={kap} className="tuval-ic" />
    </div>
  );
}
