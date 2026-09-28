import veri from './uretilen.json';
import { KARAR_TEKNOLOJI, type Teknoloji } from './teknolojiler';
import { kanitAra, type Kanit } from './kanit';
import { kararBul } from './kararlar';

// Bir karar seçeneği için karşılaştırılabilir ölçütler. Hepsi araştırma verisinden hesaplanır.
export interface Olcut {
  teknoloji?: Teknoloji;
  bulgular: Kanit[];
  risk?: { puan: number; seviye: string; bulgu: number; enOnemli: { baslik: string; siddet: string }[] };
  depo?: { ad: string; yildiz: number; sonPush: string; arsiv: boolean };
  lisans?: string;
  d1?: { toplam: number; acik: number };
  d2?: { toplam: number };
  c1?: { ad: string; toplam: number; tam: number };
  hukum?: string;
}

type RiskKaydi = { puan: number; seviye: string; bulgu: number; enOnemli: { baslik: string; siddet: string }[]; depo: Olcut['depo'] | null; lisans?: string };
const riskler = veri.risk.araclar as unknown as Record<string, RiskKaydi>;

export function kanitEtiketleri(kararId: string, deger?: string): string[] {
  const k = kararBul(kararId);
  const s = deger ? k.secenekler.find((x) => x.deger === deger) : undefined;
  return s?.kanit?.length ? s.kanit : k.kanit ?? [];
}

export function secenekOlcut(kararId: string, deger: string): Olcut {
  const t = KARAR_TEKNOLOJI[`${kararId}:${deger}`];
  const etiketler = kanitEtiketleri(kararId, deger);
  const s = kararBul(kararId).secenekler.find((x) => x.deger === deger);
  const o: Olcut = { teknoloji: t, bulgular: s?.kanit?.length ? kanitAra(s.kanit) : [] };
  if (!etiketler.length) o.bulgular = [];
  if (!t) return o;
  const r = t.risk ? riskler[t.risk] : undefined;
  if (r) { o.risk = { puan: r.puan, seviye: r.seviye, bulgu: r.bulgu, enOnemli: r.enOnemli ?? [] }; o.depo = r.depo ?? undefined; o.lisans = r.lisans; }
  const kat = t.katalog ? veri.katalog.araclar.find((a) => a.ad === t.katalog) : undefined;
  if (kat) { o.hukum = kat.hukum; o.lisans = kat.lisans || o.lisans; }
  if (t.d1) {
    const kayit = veri.d1.siniflar.flatMap((c) => c.kayitlar).filter((k) => k.motor === t.d1);
    o.d1 = { toplam: kayit.length, acik: kayit.filter((k) => k.durum === 'open').length };
  }
  if (t.d2) o.d2 = { toplam: veri.d2.siniflar.flatMap((c) => c.kayitlar).filter((k) => k.arac.startsWith(t.d2!)).length };
  if (t.c1) {
    const a = veri.c1Matris.adaylar.find((x) => x.ad.startsWith(t.c1!));
    if (a) o.c1 = { ad: a.ad, toplam: a.toplam, tam: Object.values(a.puan).filter((p) => p === 2).length };
  }
  return o;
}

export const SEVIYE_AD: Record<string, string> = { kritik: 'kritik', yuksek: 'yüksek', orta: 'orta', dusuk: 'düşük' };
export const SEVIYE_RENK: Record<string, string> = { kritik: 'red', yuksek: 'orange', orta: 'yellow', dusuk: 'green' };
export const HUKUM_AD: Record<string, string> = { kullan: 'kullan', aday: 'aday', sinirli: 'sınırlı rol', kullanma: 'kullanma', disi: 'bu hat için gereksiz' };
