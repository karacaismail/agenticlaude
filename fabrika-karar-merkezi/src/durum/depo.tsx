import { createContext, useContext, useEffect, useMemo, useReducer, type Dispatch, type ReactNode } from 'react';
import type { AsamaId, Deger, Faz, Kume } from '../veri/tipler';
import { KURALLAR } from '../veri/kurallar';
import { SENARYOLAR, senaryoBul } from '../veri/senaryolar';
import { KATEGORIK } from '../tema';

export interface KuralDurumu { acik: boolean; degerler: Record<string, Deger> }
export type NotGorunumu = 'hepsi' | 'acik-riskler' | 'gizli';

export interface Durum {
  surum: 1;
  senaryoId: string;
  kararlar: Record<string, string | string[]>;
  kurallar: Record<string, KuralDurumu>;
  kumeler: Kume[];
  asamaKume: Partial<Record<AsamaId, string>>;
  hedefFaz: Faz;
  notGorunumu: NotGorunumu;
}

const kuralVarsayilani = (hedefFaz: Faz, s = senaryoBul('tek-gorev')) => {
  const kurallar: Record<string, KuralDurumu> = {};
  for (const k of KURALLAR) {
    const degerler: Record<string, Deger> = Object.fromEntries((k.kontroller ?? []).map((c) => [c.id, c.varsayilan]));
    Object.assign(degerler, s.kuralDeger?.[k.id] ?? {});
    let acik = k.faz <= hedefFaz;
    if (s.kuralAcik?.includes(k.id)) acik = true;
    if (s.kuralKapali?.includes(k.id)) acik = false;
    kurallar[k.id] = { acik, degerler };
  }
  return kurallar;
};

export function senaryodanDurum(id: string): Durum {
  const s = senaryoBul(id);
  return {
    surum: 1,
    senaryoId: s.id,
    kararlar: { ...s.kararlar },
    kurallar: kuralVarsayilani(s.hedefFaz, s),
    kumeler: (s.kumeler ?? []).map((k) => ({ ...k })),
    asamaKume: { ...(s.asamaKume ?? {}) },
    hedefFaz: s.hedefFaz,
    notGorunumu: 'hepsi',
  };
}

export type Eylem =
  | { tur: 'senaryo'; id: string }
  | { tur: 'karar'; id: string; deger: string | string[] }
  | { tur: 'kuralAc'; id: string; acik: boolean }
  | { tur: 'kuralDeger'; id: string; kontrol: string; deger: Deger }
  | { tur: 'topluKural'; ids: string[]; acik: boolean }
  | { tur: 'faz'; faz: Faz }
  | { tur: 'kume'; id: string; alan: keyof Kume; deger: string }
  | { tur: 'kumeEkle' }
  | { tur: 'kumeSil'; id: string }
  | { tur: 'asamaKume'; asama: AsamaId; kume: string }
  | { tur: 'not'; gorunum: NotGorunumu }
  | { tur: 'yukle'; durum: Durum }
  | { tur: 'sifirla' };

function azalt(d: Durum, e: Eylem): Durum {
  switch (e.tur) {
    case 'senaryo':
      return { ...senaryodanDurum(e.id), notGorunumu: d.notGorunumu };
    case 'karar':
      return { ...d, kararlar: { ...d.kararlar, [e.id]: e.deger } };
    case 'kuralAc':
      return { ...d, kurallar: { ...d.kurallar, [e.id]: { ...d.kurallar[e.id], acik: e.acik } } };
    case 'kuralDeger': {
      const k = d.kurallar[e.id];
      return { ...d, kurallar: { ...d.kurallar, [e.id]: { ...k, degerler: { ...k.degerler, [e.kontrol]: e.deger } } } };
    }
    case 'topluKural': {
      const kurallar = { ...d.kurallar };
      for (const id of e.ids) kurallar[id] = { ...kurallar[id], acik: e.acik };
      return { ...d, kurallar };
    }
    case 'faz': {
      const kurallar = { ...d.kurallar };
      for (const k of KURALLAR) kurallar[k.id] = { ...kurallar[k.id], acik: k.faz <= e.faz };
      return { ...d, hedefFaz: e.faz, kurallar };
    }
    case 'kume':
      return { ...d, kumeler: d.kumeler.map((k) => (k.id === e.id ? { ...k, [e.alan]: e.deger } : k)) };
    case 'kumeEkle': {
      if (d.kumeler.length >= 8) return d;
      const no = d.kumeler.reduce((m, k) => Math.max(m, Number(k.id.slice(1)) || 0), 0) + 1;
      const renk = KATEGORIK.light[(no - 1) % KATEGORIK.light.length];
      return { ...d, kumeler: [...d.kumeler, { id: `K${no}`, ad: `Yeni küme ${no}`, teknoloji: 'Seçilmedi', renk, devir: '' }] };
    }
    case 'kumeSil': {
      const kalan = d.kumeler.filter((k) => k.id !== e.id);
      const ilk = kalan[0]?.id;
      const asamaKume = { ...d.asamaKume };
      for (const [a, k] of Object.entries(asamaKume)) if (k === e.id) {
        if (ilk) asamaKume[a as AsamaId] = ilk; else delete asamaKume[a as AsamaId];
      }
      return { ...d, kumeler: kalan, asamaKume };
    }
    case 'asamaKume':
      return { ...d, asamaKume: { ...d.asamaKume, [e.asama]: e.kume } };
    case 'not':
      return { ...d, notGorunumu: e.gorunum };
    case 'yukle':
      return e.durum;
    case 'sifirla':
      return { ...senaryodanDurum(d.senaryoId), notGorunumu: d.notGorunumu };
  }
}

const ANAHTAR = 'fabrika-karar-merkezi:durum:v1';

export function durumGecerliMi(x: unknown): x is Durum {
  if (!x || typeof x !== 'object') return false;
  const d = x as Durum;
  return d.surum === 1 && SENARYOLAR.some((s) => s.id === d.senaryoId) && typeof d.kararlar === 'object' && typeof d.kurallar === 'object' && Array.isArray(d.kumeler);
}

function baslangic(): Durum {
  try {
    const ham = localStorage.getItem(ANAHTAR);
    if (ham) {
      const d = JSON.parse(ham);
      if (durumGecerliMi(d)) {
        // Yeni eklenen kuralları eksiksiz tut.
        const tam = senaryodanDurum(d.senaryoId);
        return { ...tam, ...d, kurallar: { ...tam.kurallar, ...d.kurallar }, kararlar: { ...tam.kararlar, ...d.kararlar } };
      }
    }
  } catch { /* tarayıcı depolaması yoksa varsayılan */ }
  return senaryodanDurum('tek-gorev');
}

const DurumBaglami = createContext<{ durum: Durum; gonder: Dispatch<Eylem> } | null>(null);

export function DurumSaglayici({ children }: { children: ReactNode }) {
  const [durum, gonder] = useReducer(azalt, undefined, baslangic);
  useEffect(() => {
    try { localStorage.setItem(ANAHTAR, JSON.stringify(durum)); } catch { /* yok say */ }
  }, [durum]);
  const deger = useMemo(() => ({ durum, gonder }), [durum]);
  return <DurumBaglami.Provider value={deger}>{children}</DurumBaglami.Provider>;
}

export function useDurum() {
  const b = useContext(DurumBaglami);
  if (!b) throw new Error('DurumSaglayici eksik');
  return b;
}
