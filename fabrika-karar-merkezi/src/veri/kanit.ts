import ham from './kanitlar.json';

// Bulgu tabanı: araştırma dosyalarından çıkarılan, kaynaklı ve somut ifadeler (scripts/kanit-uret.mjs).
export interface Kanit {
  id: string;
  kod: string;
  tur: string;
  baslik: string;
  metin: string;
  url?: string;
  tarih?: string;
  dogrulama?: string;
  dosya?: string;
  kaynakMetin?: string;
  etiket: string[];
}

export const KANITLAR = ham.kanitlar as Kanit[];
export const TUR_AD = ham.turler as Record<string, string>;

// Sıra: doğrudan gözlem ve ölçüm önce, öngörü ve senaryo en sonda.
export const TUR_SIRA = ['pilot', 'olcum', 'vaka', 'hata', 'guvenlik', 'olay', 'belge', 'kurum', 'akademik', 'degisim', 'pano', 'olgu', 'ongoru', 'senaryo'];
export const TUR_RENK: Record<string, string> = {
  pilot: 'orange', olcum: 'blue', vaka: 'teal', hata: 'red', guvenlik: 'grape', olay: 'pink', belge: 'gray',
  kurum: 'cyan', akademik: 'indigo', degisim: 'yellow', pano: 'lime', olgu: 'dark', ongoru: 'gray', senaryo: 'violet',
};
export const TUR_ACIKLAMA: Record<string, string> = {
  pilot: 'Önceki Kestra pilotunda ölçülen ya da gözlenen',
  olcum: 'Sayısal ölçüm ya da resmî sınır değeri',
  vaka: 'Gerçekleşmiş bir kurum ya da proje vakası',
  hata: 'Açık kaynak issue ya da PR kaydı',
  guvenlik: 'Risk haritasındaki güvenlik ve işletim bulgusu',
  olay: 'Tarihli olay kaydı',
  belge: 'Resmî belge ya da kaynak koddan okunan',
  kurum: 'Üretimde ajan kullanan kurumun anlattığı',
  akademik: 'Hakemli ya da ön baskı çalışma',
  degisim: 'Araç, model ya da protokolde tarihli değişiklik',
  pano: 'Senin panolarından türetilen 23.09 raporu',
  olgu: 'Araştırmada doğrulanmış olgu',
  ongoru: 'Gerçekleşmemiş, ön-ölüm öngörüsü',
  senaryo: 'Risk haritasındaki olası senaryo',
};

export const KAYNAK_AD: Record<string, string> = {
  A0: 'Pilot incelemesi (A0)', KP: 'Pilot kök nedenleri', E6: 'Kestra geçmişi (E6)', A1: 'Kurum örnekleri (A1)', A2: 'Platform ve kapasite (A2)',
  A3: 'Havuz, skill, MCP (A3)', B1: 'Hazır projeler (B1)', B2: 'Vaka kataloğu (B2)', B3: 'Ön-ölüm (B3)', C1: 'Hazır sistemler (C1)',
  C2: 'OpenHands, Symphony (C2)', C3: 'Tak-çıkar (C3)', C4: 'Büyük yapımlar (C4)', C5: 'HRMS ve oracle (C5)', C6: 'Ölçek (C6)',
  D1: 'Orkestratör hataları (D1)', D2: 'Ajan platformu hataları (D2)', E4: 'Mimari karşılaştırma (E4)', E5: 'Araştırma karşılaştırması (E5)',
  CX: 'Codex incelemesi (kopya)', RH: 'Risk haritası', OL: 'Olay kaydı', SN: 'Risk senaryoları', PN: 'Senin panoların (23.09)',
};

export const ETIKET_AD: Record<string, string> = {
  tetik: 'Tetik ve webhook', durum: 'Durum ve orkestrasyon', birlestirme: 'Birleştirme ve trunk', insan: 'İnsan inceleme ve kabul',
  dogrulayici: 'Bağımsız doğrulama', oracle: 'Oracle ve test gücü', sandbox: 'Sandbox ve izolasyon', sunucu: 'Sunucu ve çalışma yeri',
  model: 'Model erişimi ve limitler', maliyet: 'Maliyet', guvenlik: 'Güvenlik', mcp: 'MCP', skill: 'Skill', yonerge: 'Yönerge dosyaları',
  bekleme: 'Bekleme ve zaman aşımı', bellek: 'Bellek', olcek: 'Ölçek ve eşzamanlılık', ortam: 'Ortam ve dağıtım', bildirim: 'Bildirim', hrms: 'HRMS',
  temporal: 'Temporal', dbos: 'DBOS', restate: 'Restate', kestra: 'Kestra', n8n: 'n8n', hermes: 'Hermes', openclaw: 'OpenClaw', openhands: 'OpenHands',
  'claude-code': 'Claude Code', 'codex-cli': 'Codex CLI', goose: 'goose', jev: 'Jev', pydantic: 'PydanticAI', dspy: 'DSPy', langgraph: 'LangGraph',
  plane: 'Plane', github: 'GitHub', e2b: 'E2B', daytona: 'Daytona', docker: 'Docker', litellm: 'LiteLLM', symphony: 'Symphony', langfuse: 'Langfuse',
  playwright: 'Playwright', openfga: 'OpenFGA', pi: 'Pi',
  postman: 'Postman', newman: 'Newman', hoppscotch: 'Hoppscotch', bruno: 'Bruno', hurl: 'Hurl', insomnia: 'Insomnia', yaak: 'Yaak', apidog: 'Apidog',
  httpie: 'HTTPie / xh', schemathesis: 'Schemathesis', karate: 'Karate', httpdosya: '.http dosyaları', posting: 'Posting', thunder: 'Thunder Client', mockoon: 'Mockoon',
};

const INDEKS = (() => {
  const m = new Map<string, Kanit[]>();
  for (const k of KANITLAR) for (const e of k.etiket) m.set(e, [...(m.get(e) ?? []), k]);
  return m;
})();

const sirala = (a: Kanit, b: Kanit) => {
  const t = TUR_SIRA.indexOf(a.tur) - TUR_SIRA.indexOf(b.tur);
  if (t) return t;
  return String(b.tarih ?? '').localeCompare(String(a.tarih ?? ''));
};

// Etiketlerden herhangi birini taşıyan bulgular (birleşim), önem sırasına göre.
export function kanitAra(etiketler: string[]): Kanit[] {
  const gorulen = new Set<string>();
  const out: Kanit[] = [];
  for (const e of etiketler) for (const k of INDEKS.get(e) ?? []) if (!gorulen.has(k.id)) { gorulen.add(k.id); out.push(k); }
  return out.sort(sirala);
}

export function turSayilari(liste: Kanit[]): [string, number][] {
  const s: Record<string, number> = {};
  for (const k of liste) s[k.tur] = (s[k.tur] ?? 0) + 1;
  return TUR_SIRA.filter((t) => s[t]).map((t) => [t, s[t]]);
}

export const kanitBul = (id: string) => KANITLAR.find((k) => k.id === id);

// Araç adından bulgulara: bilinen araçlar etiketle, diğerleri adla aranır.
// Dizi değer: bulgu bu etiketlerin hepsini taşımalı (Plane MCP = Plane ve MCP).
const AD_ETIKET: Record<string, string | string[]> = {
  Temporal: 'temporal', Kestra: 'kestra', DBOS: 'dbos', Restate: 'restate', n8n: 'n8n', 'Hermes Agent': 'hermes', 'Hermes Kanban': 'hermes',
  OpenClaw: 'openclaw', OpenHands: 'openhands', Pi: 'pi', Postman: 'postman', 'Postman CLI': 'postman', Newman: 'newman', Hoppscotch: 'hoppscotch', 'Hoppscotch CLI': 'hoppscotch',
  Bruno: 'bruno', 'Bruno CLI': 'bruno', Hurl: 'hurl', Insomnia: 'insomnia', Yaak: 'yaak', Apidog: 'apidog', 'HTTPie / xh': 'httpie', Schemathesis: 'schemathesis', Karate: 'karate',
  httpyac: 'httpdosya', 'IntelliJ HTTP Client CLI': 'httpdosya', Posting: 'posting', 'Thunder Client': 'thunder', 'Claude Code': 'claude-code', 'Codex CLI': 'codex-cli', goose: 'goose', 'Jev (TypeSafe AI)': 'jev',
  PydanticAI: 'pydantic', DSPy: 'dspy', LangGraph: 'langgraph', Plane: 'plane', 'Plane MCP Server': ['plane', 'mcp'], E2B: 'e2b', Daytona: 'daytona',
  LiteLLM: 'litellm', Langfuse: 'langfuse', Playwright: 'playwright', 'Playwright MCP': ['playwright', 'mcp'], OpenFGA: 'openfga',
  'GitHub Actions + merge queue': 'github', 'OpenAI Symphony': 'symphony', 'Docker Engine + çıkış vekili': 'docker',
};
export function aracKanitlari(ad: string): Kanit[] {
  const e = AD_ETIKET[ad];
  if (Array.isArray(e)) return kanitAra([e[0]]).filter((k) => e.every((x) => k.etiket.includes(x)));
  if (e) return kanitAra([e]);
  const q = ad.split(/[·(/]/)[0].trim().toLocaleLowerCase('tr-TR');
  if (q.length < 3) return [];
  return KANITLAR.filter((k) => `${k.baslik} ${k.metin}`.toLocaleLowerCase('tr-TR').includes(q)).sort(sirala).slice(0, 400);
}
