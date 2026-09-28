// Uygulamanın veri tipleri. Metinler Türkçe, kimlikler kısa ve sabittir.
export type BolumId = 'plane' | 'rdd' | 'github' | 'alpha' | 'capraz';
export type AsamaId =
  | 'GIR' | 'TET' | 'ARS' | 'HAR' | 'PLN' | 'RED' | 'GRN'
  | 'KAP' | 'QA' | 'RSK' | 'MQ' | 'DEP' | 'HT' | 'KAB'
  | 'HATA' | 'BUT' | 'GUV' | 'GOZ' | 'OGR';
export type Aktor = 'insan' | 'ajan' | 'deterministik' | 'olay' | 'karma';
export type Faz = 0 | 1 | 2 | 3;
export type Deger = boolean | number | string | string[];

export type Kontrol =
  | { tur: 'sayi'; id: string; etiket: string; birim?: string; min: number; max: number; adim?: number; varsayilan: number }
  | { tur: 'radyo'; id: string; etiket: string; secenekler: { deger: string; etiket: string }[]; varsayilan: string }
  | { tur: 'kutu'; id: string; etiket: string; secenekler: { deger: string; etiket: string }[]; varsayilan: string[] };

export interface EcaKural {
  id: string;
  asama: AsamaId;
  baslik: string;
  olay: string;
  kosul: string;
  eylem: string;
  kontroller?: Kontrol[];
  onler: string[];
  kaynak: string[];
  faz: Faz;
  neden: string;
}

export interface Asama {
  id: AsamaId;
  bolum: BolumId;
  kod: string;
  ad: string;
  aktor: Aktor;
  ajanlar: string[];
  skill: string[];
  mcp: string[];
  aciklama: string;
  cikti: string;
}

export interface Olgu { metin: string; kaynak: string }

export interface KararSecenek {
  deger: string;
  etiket: string;
  ozet?: string;
  olgular?: Olgu[];
  dikkat?: string;
  kanit?: string[];
}

export interface Karar {
  id: string;
  baslik: string;
  soru: string;
  tur: 'radyo' | 'kutu';
  secenekler: KararSecenek[];
  varsayilan: string | string[];
  kaynak: string[];
  olgular?: Olgu[];
  kanit?: string[];
}

export interface Kume {
  id: string;
  ad: string;
  teknoloji: string;
  renk: string;
  devir: string;
}

export type NotTuru = 'kestra' | 'dunya' | 'codex' | 'bilgi';

export interface YapiskanNot {
  asama: AsamaId;
  tur: NotTuru;
  metin: string;
  kural?: string;
  kaynak: string;
}

export interface Senaryo {
  id: string;
  ad: string;
  kisa: string;
  ozet: string;
  neZaman: string;
  kararlar: Record<string, string | string[]>;
  kumeler?: Kume[];
  asamaKume?: Partial<Record<AsamaId, string>>;
  hedefFaz: Faz;
  kuralAcik?: string[];
  kuralKapali?: string[];
  kuralDeger?: Record<string, Record<string, Deger>>;
  bulgular: string[];
  notlar?: YapiskanNot[];
}

export type SorunKaynak = 'kestra' | 'd1' | 'd2' | 'd2d' | 'b2' | 'b3' | 'codex';

export interface Sorun {
  id: string;
  kaynak: SorunKaynak;
  baslik: string;
  ozet: string;
  ayrinti?: string;
  kayitSayisi?: number;
  kayitlar?: { baslik: string; alt?: string; url?: string }[];
}
