import type { AsamaId, NotTuru } from '../veri/tipler';
import type { Durum } from '../durum/depo';
import type { Turetilen } from '../durum/hesap';
import { AKIS_SIRASI, BOLUMLER, asamaBul } from '../veri/asamalar';
import { KURALLAR } from '../veri/kurallar';
import { HAVUZ_ADIMLARI } from '../veri/ajanlar';
import { secenekEtiket } from '../veri/kararlar';
import { AKTOR_RENK, acikTon } from '../tema';
import { temizle } from './metin';

export interface YerlesikNot { hedef: string; tur: NotTuru; metin: string; durum: 'acik' | 'kapali' | 'bilgi'; kural?: string; kaynak: string }
export interface Diyagram { id: string; baslik: string; aciklama: string; kod: string; notlar: YerlesikNot[]; d2?: string }

type Sekil = 'kutu' | 'stadyum' | 'alt' | 'olay' | 'altigen' | 'karar';
interface Dugum { id: string; baslik: string; satirlar: string[]; sekil: Sekil; sinif: string; grup: string | null }
interface Kenar { a: string; b: string; etiket?: string; tur: 'duz' | 'noktali' }
interface Grup { id: string; baslik: string; alt: string; renk: string }

class Model {
  dugumler: Dugum[] = [];
  kenarlar: Kenar[] = [];
  notlar: YerlesikNot[] = [];
  constructor(public gruplar: Grup[]) {}
  var(id: string) { return this.dugumler.some((d) => d.id === id); }
  ekle(id: string, baslik: string, satirlar: (string | false | undefined | null)[], sekil: Sekil, sinif: string, grup: string | null) {
    if (!this.var(id)) this.dugumler.push({ id, baslik, satirlar: satirlar.filter(Boolean) as string[], sekil, sinif, grup });
    return id;
  }
  bagla(a: string, b: string, etiket?: string, tur: 'duz' | 'noktali' = 'duz') {
    this.kenarlar.push({ a, b, etiket, tur });
  }
}

// ---------------- Ortak parçalar ----------------
const AKTOR_SEKIL: Record<string, Sekil> = { insan: 'stadyum', ajan: 'kutu', deterministik: 'alt', olay: 'olay', karma: 'altigen' };

const SINIFLAR: Record<string, { dolgu: string; kenar: string; yazi?: string; kesik?: boolean }> = {
  insan: { dolgu: AKTOR_RENK.insan.dolgu, kenar: AKTOR_RENK.insan.kenar },
  ajan: { dolgu: AKTOR_RENK.ajan.dolgu, kenar: AKTOR_RENK.ajan.kenar },
  deterministik: { dolgu: AKTOR_RENK.deterministik.dolgu, kenar: AKTOR_RENK.deterministik.kenar },
  olay: { dolgu: AKTOR_RENK.olay.dolgu, kenar: AKTOR_RENK.olay.kenar },
  karma: { dolgu: AKTOR_RENK.karma.dolgu, kenar: AKTOR_RENK.karma.kenar },
  karar: { dolgu: '#ffffff', kenar: '#495057' },
  bekle: { dolgu: '#fff9db', kenar: '#f08c00', kesik: true },
  hata: { dolgu: '#fff5f5', kenar: '#e03131' },
  bitti: { dolgu: '#ebfbee', kenar: '#2f9e44' },
  kapali: { dolgu: '#f1f3f5', kenar: '#adb5bd', yazi: '#868e96', kesik: true },
};

function gruplariKur(d: Durum, t: Turetilen): { grupOf: (a: AsamaId) => string | null; liste: Grup[] } {
  if (t.gorunum === 'kumesiz') return { grupOf: () => null, liste: [] };
  if (t.gorunum === 'bolum') {
    return {
      grupOf: (a) => `G_${asamaBul(a).bolum}`,
      liste: BOLUMLER.filter((b) => b.id !== 'capraz').map((b) => ({ id: `G_${b.id}`, baslik: b.ad, alt: b.alt, renk: b.renk })),
    };
  }
  const ilkSira = (kid: string) => {
    const i = AKIS_SIRASI.findIndex((a) => t.kumeOf(a) === kid);
    return i < 0 ? 999 : i;
  };
  const sirali = [...d.kumeler].sort((x, y) => ilkSira(x.id) - ilkSira(y.id));
  return {
    grupOf: (a) => (t.kumeOf(a) ? `G_${t.kumeOf(a)}` : null),
    liste: sirali.map((k, i) => ({ id: `G_${k.id}`, baslik: `Küme ${i + 1} · ${k.teknoloji}`, alt: k.ad, renk: k.renk })),
  };
}

function asamaSatirlari(aid: AsamaId, t: Turetilen, kisa: boolean): string[] {
  const a = asamaBul(aid);
  const s = [t.asamaTeknoloji(aid)];
  if (kisa) return s;
  if (a.ajanlar.length) s.push(`Ajan: ${a.ajanlar.slice(0, 3).join(', ')}`);
  if (a.skill.length) s.push(`Skill: ${a.skill.join(', ')}`);
  if (a.mcp.length) s.push(`MCP: ${a.mcp.join(', ')}`);
  return s;
}

function notlariEkle(m: Model, d: Durum, t: Turetilen, asamalar: AsamaId[]) {
  if (d.notGorunumu === 'gizli') return;
  for (const n of t.notlar) {
    if (!asamalar.includes(n.asama) || !m.var(n.asama)) continue;
    const durum = n.kural ? (t.aktif(n.kural) ? 'acik' : 'kapali') : 'bilgi';
    if (d.notGorunumu === 'acik-riskler' && durum !== 'kapali') continue;
    m.notlar.push({ hedef: n.asama, tur: n.tur, metin: n.metin, durum, kural: n.kural, kaynak: n.kaynak });
  }
}

// ---------------- Mermaid metni ----------------
const mdEtiket = (baslik: string, satirlar: string[]) =>
  `"\`**${temizle(baslik)}**${satirlar.map((s) => '\n' + temizle(s)).join('')}\`"`;

function sekilMetni(d: Dugum): string {
  const e = mdEtiket(d.baslik, d.satirlar);
  switch (d.sekil) {
    case 'stadyum': return `${d.id}([${e}])`;
    case 'alt': return `${d.id}[[${e}]]`;
    case 'olay': return `${d.id}>${e}]`;
    case 'altigen': return `${d.id}{{${e}}}`;
    case 'karar': return `${d.id}{${e}}`;
    default: return `${d.id}[${e}]`;
  }
}

function mermaidMetni(m: Model, yon: 'TB' | 'LR', icYon?: 'TB' | 'LR'): string {
  const o: string[] = [`flowchart ${yon}`];
  for (const d of m.dugumler.filter((x) => !x.grup)) o.push(`  ${sekilMetni(d)}:::${d.sinif}`);
  for (const g of m.gruplar) {
    const ic = m.dugumler.filter((x) => x.grup === g.id);
    if (!ic.length) continue;
    o.push(`  subgraph ${g.id}["${temizle(`${g.baslik} · ${g.alt}`)}"]`);
    if (icYon) o.push(`    direction ${icYon}`);
    for (const d of ic) o.push(`    ${sekilMetni(d)}:::${d.sinif}`);
    o.push('  end');
    o.push(`  style ${g.id} fill:${acikTon(g.renk, 0.9)},stroke:${g.renk},stroke-width:1.5px,color:#0b0b0b`);
  }
  for (const k of m.kenarlar) {
    const ok = k.tur === 'noktali' ? '-.->' : '-->';
    o.push(k.etiket ? `  ${k.a} ${ok}|"${temizle(k.etiket)}"| ${k.b}` : `  ${k.a} ${ok} ${k.b}`);
  }
  for (const [ad, s] of Object.entries(SINIFLAR))
    o.push(`  classDef ${ad} fill:${s.dolgu},stroke:${s.kenar},stroke-width:1.5px,color:${s.yazi ?? '#0b0b0b'}${s.kesik ? ',stroke-dasharray:5 3' : ''}`);
  return o.join('\n');
}

// ---------------- D2 metni ----------------
// D2 çift tırnak içindeki $ işaretini değişken sanar; para birimi yazıyla verilir.
const d2q = (s: string) => JSON.stringify(s.replace(/\$/g, 'USD'));
const D2_SEKIL: Record<Sekil, string> = { kutu: 'rectangle', stadyum: 'rectangle', alt: 'rectangle', olay: 'parallelogram', altigen: 'hexagon', karar: 'diamond' };
const NOT_D2: Record<string, string> = { kestra: '#FFD8A8', dunya: '#FFF3A3', codex: '#D0EBFF', bilgi: '#E6FCF5' };

function d2Metni(m: Model, yon: 'down' | 'right', baslik: string, icYon?: 'down' | 'right'): string {
  const o: string[] = [`# ${baslik}`, '# Fabrika Karar Merkezi ile üretildi. Çizmek için: d2 dosya.d2 dosya.svg', `direction: ${yon}`, 'classes: {'];
  for (const [ad, s] of Object.entries(SINIFLAR))
    o.push(`  ${ad}: { style: { fill: ${d2q(s.dolgu)}; stroke: ${d2q(s.kenar)}; font-color: ${d2q(s.yazi ?? '#0b0b0b')}${s.kesik ? '; stroke-dash: 4' : ''} } }`);
  o.push('}');
  const yol = (id: string) => {
    const d = m.dugumler.find((x) => x.id === id);
    return d?.grup ? `${d.grup}.${id}` : id;
  };
  const dugumD2 = (d: Dugum, girinti: string) => {
    o.push(`${girinti}${d.id}: ${d2q([d.baslik, ...d.satirlar].join('\n'))} {`);
    o.push(`${girinti}  class: ${d.sinif}`);
    o.push(`${girinti}  shape: ${D2_SEKIL[d.sekil]}`);
    if (d.sekil === 'stadyum') o.push(`${girinti}  style.border-radius: 16`);
    if (d.sekil === 'alt') o.push(`${girinti}  style.double-border: true`);
    o.push(`${girinti}}`);
  };
  for (const d of m.dugumler.filter((x) => !x.grup)) dugumD2(d, '');
  for (const g of m.gruplar) {
    const ic = m.dugumler.filter((x) => x.grup === g.id);
    if (!ic.length) continue;
    o.push(`${g.id}: ${d2q(`${g.baslik}\n${g.alt}`)} {`);
    if (icYon) o.push(`  direction: ${icYon}`);
    o.push(`  style.fill: ${d2q(acikTon(g.renk, 0.9))}`);
    o.push(`  style.stroke: ${d2q(g.renk)}`);
    for (const d of ic) dugumD2(d, '  ');
    o.push('}');
  }
  for (const k of m.kenarlar) {
    const a = m.gruplar.some((g) => g.id === k.a) ? k.a : yol(k.a);
    const b = m.gruplar.some((g) => g.id === k.b) ? k.b : yol(k.b);
    const et = k.etiket ? `: ${d2q(k.etiket)}` : '';
    o.push(k.tur === 'noktali' ? `${a} -> ${b}${et} { style.stroke-dash: 4 }` : `${a} -> ${b}${et}`);
  }
  m.notlar.forEach((n, i) => {
    const durum = n.durum === 'acik' ? `✓ Önlem açık: ${n.kural}` : n.durum === 'kapali' ? `⚠ Önlem kapalı: ${n.kural}` : 'Bilgi';
    o.push(`not${i + 1}: ${d2q(`${n.metin}\n${durum} · ${n.kaynak}`)} {`);
    o.push('  shape: page');
    o.push(`  style.fill: ${d2q(NOT_D2[n.tur])}`);
    if (n.durum === 'kapali') o.push('  style.stroke: "#e03131"');
    o.push('  style.font-size: 13');
    o.push('}');
    o.push(`not${i + 1} -> ${yol(n.hedef)} { style.stroke-dash: 3 }`);
  });
  return o.join('\n');
}

// ---------------- 1) Küme akışı (genel bakış) ----------------
export function genelDiyagram(d: Durum, t: Turetilen): Diyagram {
  const g = gruplariKur(d, t);
  const m = new Model(g.liste);
  const nid = (a: AsamaId) => `o_${a}`;
  for (const aid of AKIS_SIRASI) {
    const a = asamaBul(aid);
    const kapali = KURALLAR.filter((k) => k.asama === aid && k.faz <= d.hedefFaz && !t.aktif(k.id)).length;
    const pasif = (aid === 'HAR' && !t.aktif('R11')) || (aid === 'QA' && t.karar('qa') === 'yok');
    m.ekle(nid(aid), `${a.kod} · ${a.ad}`, [...asamaSatirlari(aid, t, true), kapali ? `⚠ ${kapali} önlem kapalı` : null], AKTOR_SEKIL[a.aktor], pasif ? 'kapali' : a.aktor, g.grupOf(aid));
  }
  const gorulen = new Set<string>();
  for (let i = 0; i < AKIS_SIRASI.length - 1; i++) {
    const a = AKIS_SIRASI[i], b = AKIS_SIRASI[i + 1];
    const ga = g.grupOf(a), gb = g.grupOf(b);
    if (ga === gb) { m.bagla(nid(a), nid(b)); continue; }
    if (!ga || !gb || gorulen.has(`${ga}>${gb}`)) continue;
    gorulen.add(`${ga}>${gb}`);
    const kume = d.kumeler.find((k) => `G_${k.id}` === ga);
    m.bagla(ga, gb, (t.gorunum === 'kume' && kume?.devir) || asamaBul(a).cikti);
  }
  if (t.aktif('R43')) {
    // Geri ok yerleşimi bozduğu için ret döngüsü uç düğümle gösterilir.
    m.ekle('o_YENI', '↩ Ret → Plane\'e yeni iş', ['geri alma PR\'ı + ret notları'], 'stadyum', 'olay', g.grupOf('KAB'));
    m.bagla(nid('KAB'), 'o_YENI', 'ret', 'noktali');
  }
  const baslik = t.gorunum === 'kume' ? 'Küme akışı' : t.gorunum === 'bolum' ? 'Ana bölümler' : 'Tek akış';
  return {
    id: 'genel', baslik: `1 · ${baslik}`,
    aciklama: t.gorunum === 'kume' ? 'Her küme kendi teknolojisiyle çalışır; küme içindeki akış bitince oklar sıradaki kümeye geçer.' : 'Plane → agentic-rdd-development → GitHub CI/CD → alpha.example.com',
    kod: mermaidMetni(m, t.gorunum === 'kumesiz' ? 'TB' : 'LR', t.gorunum === 'kumesiz' ? undefined : 'TB'),
    notlar: [],
    d2: d2Metni(m, 'down', `${t.senaryo.ad} · ${baslik}`),
  };
}

// ---------------- 2–3) Ayrıntılı akış (kurallarla) ----------------
type Parca = 'ilk' | 'son' | 'tam';
function ayrintiModeli(d: Durum, t: Turetilen, parca: Parca): Model {
  const g = gruplariKur(d, t);
  const m = new Model(g.liste);
  const grp = (a: AsamaId) => g.grupOf(a);
  const v = (k: string, c: string) => t.deger(k, c) as number | string;
  const A = (aid: AsamaId, pasif = false) => {
    const a = asamaBul(aid);
    return m.ekle(aid, `${a.kod} · ${a.ad}`, asamaSatirlari(aid, t, false), AKTOR_SEKIL[a.aktor], pasif ? 'kapali' : a.aktor, grp(aid));
  };
  const hatirlatma = t.aktif('R39') ? `${v('R39', 'hatirlat')} s hatırlat · ${v('R39', 'yukselt')} s yükselt` : '⚠ süre ve sahip kuralı kapalı';

  if (parca !== 'son') {
    A('GIR'); A('TET');
    m.bagla('GIR', 'TET', 'form tamam');
    let onceki = 'TET'; let etiket: string | undefined;
    if (t.aktif('R01')) {
      const alan = ((t.deger('R01', 'alanlar') as string[]) ?? []).length;
      m.ekle('DOR', 'DoR tamam mı?', [`${alan} zorunlu alan`], 'karar', 'karar', grp('GIR'));
      m.ekle('WPO', 'WAITING_FOR_PO', ['sahibi: Product Owner', hatirlatma], 'stadyum', 'bekle', grp('GIR'));
      m.bagla('TET', 'DOR');
      m.bagla('DOR', 'WPO', 'hayır: eksikleri yaz');
      m.bagla('WPO', 'ARS', 'cevap geldi', 'noktali');
      onceki = 'DOR'; etiket = 'evet';
    }
    A('ARS');
    m.bagla(onceki, 'ARS', etiket ?? (t.aktif('R03') ? 'tekil koşu' : undefined));
    if (t.aktif('R08')) {
      m.ekle('WPO', 'WAITING_FOR_PO', ['sahibi: Product Owner', hatirlatma], 'stadyum', 'bekle', grp('ARS'));
      m.bagla('ARS', 'WPO', `belirsiz: ${v('R08', 'dongu')} turdan sonra soru`, 'noktali');
    }
    A('HAR', !t.aktif('R11'));
    m.bagla('ARS', 'HAR', 'task spec');
    A('PLN');
    m.bagla('HAR', 'PLN');
    if (t.aktif('R13')) {
      const esik = String(v('R13', 'esik'));
      m.ekle('PLQ', esik === 'hepsi' ? 'Her plan incelenir' : `Risk ${esik === 'yuksek' ? 'yüksek' : 'orta ya da üstü'} mi?`, ['hakem: farklı model ailesi'], 'karar', 'karar', grp('PLN'));
      m.ekle('HON', 'İnsan plan onayı', ['yüksek riskte · sinyal ile'], 'stadyum', 'insan', grp('PLN'));
      m.bagla('PLN', 'PLQ');
      m.bagla('PLQ', 'HON', 'yüksek risk');
      m.bagla('PLQ', 'RED', 'hakem onayı');
      m.bagla('HON', 'RED', 'onay');
    } else m.bagla('PLN', 'RED', 'plan');
    A('RED');
    if (t.aktif('R14')) {
      m.ekle('RDQ', 'Beklenen nedenle kırmızı mı?', ['JUnit: doğrulama hatası'], 'karar', 'karar', grp('RED'));
      m.ekle('BT', 'BLOCKED_TEST', ['QA inceler; kodlama başlamaz'], 'stadyum', 'hata', grp('RED'));
      m.bagla('RED', 'RDQ');
      m.bagla('RDQ', 'BT', 'hayır');
      m.bagla('RDQ', 'GRN', t.aktif('R15') ? 'evet · testler kilitlendi' : 'evet');
    } else m.bagla('RED', 'GRN', t.aktif('R15') ? 'testler kilitlendi' : 'test yazıldı');
    A('GRN');
    if (t.aktif('R17')) {
      m.ekle('ERR', 'ERROR', [`${v('R17', 'deneme')} deneme / ${v('R17', 'dakika')} dk / ${v('R17', 'tavan')} $ doldu`, 'kanıt paketi → team lead'], 'stadyum', 'hata', grp('GRN'));
      m.bagla('GRN', 'ERR', 'bütçe doldu', 'noktali');
    }
    if (t.aktif('R18')) {
      m.ekle('TIK', 'Tıkanıklık çözücü', [`${v('R18', 'dakika')} dk ilerleme yok`, 'strateji · böl · doğru kişiye sor'], 'altigen', 'karma', grp('GRN'));
      m.bagla('GRN', 'TIK', 'ilerleme yok', 'noktali');
      m.bagla('TIK', 'GRN', 'yeni yol', 'noktali');
    }
    if (parca === 'ilk') {
      m.ekle('CIK', 'PR açıldı', ['→ GitHub CI/CD (3. diyagram)'], 'stadyum', 'olay', grp('GRN'));
      m.bagla('GRN', 'CIK');
    }
    notlariEkle(m, d, t, ['GIR', 'TET', 'ARS', 'HAR', 'PLN', 'RED', 'GRN']);
  }

  if (parca !== 'ilk') {
    if (parca === 'son') {
      m.ekle('GIRIS', 'PR geldi', ['agentic-rdd-development\'tan'], 'stadyum', 'olay', grp('KAP'));
      m.bagla('GIRIS', 'KAP');
    } else m.bagla('GRN', 'KAP', 'PR');
    A('KAP');
    m.ekle('KQ', 'Kapılar yeşil mi?', [t.aktif('R22') ? 'flaky / skip / boş takım sayılmaz' : '⚠ sahte yeşil kuralı kapalı', t.aktif('R23') ? 'bütün zorunlu kontroller bitti' : ''], 'karar', 'karar', grp('KAP'));
    m.bagla('KAP', 'KQ', t.aktif('R24') ? 'aynı SHA' : undefined);
    const donus = t.aktif('R16') ? `birincil ${v('R16', 'birincil')} + yedek ${v('R16', 'yedek')} deneme` : 'deneme sınırı kapalı';
    if (parca === 'son') {
      m.ekle('DON', '↩ GREEN\'e dön', [donus], 'stadyum', 'hata', grp('KAP'));
      m.bagla('KQ', 'DON', 'hayır');
    } else m.bagla('KQ', 'GRN', `hayır: ${donus}`, 'noktali');
    const qaYok = t.karar('qa') === 'yok';
    A('QA', qaYok);
    m.bagla('KQ', 'QA', 'evet');
    if (!qaYok && t.aktif('R26')) m.bagla('QA', parca === 'son' ? 'DON' : 'GRN', `bulgu (en fazla ${v('R26', 'tur')} tur)`, 'noktali');
    A('RSK');
    m.bagla('QA', 'RSK', qaYok ? 'QA yok: doğrudan' : 'ölçütler tamam');
    if (t.aktif('R29')) {
      m.ekle('RQ', 'Risk sınıfı?', ['beyan + hassas yol + fark'], 'karar', 'karar', grp('RSK'));
      m.ekle('HON2', 'İnsan onayı', ['yüksek risk'], 'stadyum', 'insan', grp('RSK'));
      m.ekle('GERI', 'Geri al + insana devret', ['yasaklı: otomatik düzeltme yok'], 'stadyum', 'hata', grp('RSK'));
      m.bagla('RSK', 'RQ');
      m.bagla('RQ', 'MQ', 'orta / düşük');
      m.bagla('RQ', 'HON2', 'yüksek');
      m.bagla('HON2', 'MQ', 'onay');
      m.bagla('RQ', 'GERI', 'yasaklı');
    } else m.bagla('RSK', 'MQ', '⚠ risk hesaplanmıyor');
    A('MQ');
    if (t.aktif('R33')) {
      m.ekle('FRZ', 'Trunk kırık: dondur', ['yalnız onarım ve geri alma'], 'stadyum', 'bekle', grp('MQ'));
      m.bagla('MQ', 'FRZ', 'ana dal kırmızı', 'noktali');
    }
    A('DEP');
    m.bagla('MQ', 'DEP', t.aktif('R31') ? 'birleşik sonuç yeşil' : 'birleşti');
    if (t.aktif('R35')) {
      m.ekle('DQ', '/_surum + /_saglik + duman?', ['birleşim SHA\'sı alpha\'da mı'], 'karar', 'karar', grp('DEP'));
      m.ekle('DER', 'Dağıtım hatası', ['kod hatası değil → işletim'], 'stadyum', 'hata', grp('DEP'));
      m.bagla('DEP', 'DQ');
      m.bagla('DQ', 'DER', 'hayır');
      m.bagla('DQ', 'HT', 'evet');
    } else m.bagla('DEP', 'HT', '⚠ sürüm doğrulanmıyor');
    if (t.aktif('R37')) {
      m.ekle('UE', 'unknown_effect', ['önce sorgula, deftere yaz, sonra karar'], 'stadyum', 'bekle', grp('DEP'));
      m.bagla('DEP', 'UE', 'yanıt yok', 'noktali');
    }
    A('HT');
    if (t.aktif('R39')) {
      m.ekle('ESC', 'Sahipli bekleme', [hatirlatma], 'stadyum', 'bekle', grp('HT'));
      m.bagla('HT', 'ESC', 'bekleme', 'noktali');
    }
    A('KAB');
    m.bagla('HT', 'KAB', t.aktif('R41') ? 'her madde ✓/✗ + not' : 'test sonucu');
    m.ekle('DONE', 'Done', ['insan kabul etti'], 'stadyum', 'bitti', grp('KAB'));
    m.bagla('KAB', 'DONE', 'kabul');
    const ortam = ((d.kararlar.ortamlar as string[]) ?? []).filter((o) => o !== 'alpha');
    if (ortam.length) {
      m.ekle('TERFI', 'Aynı imajın terfisi', [ortam.map((o) => secenekEtiket('ortamlar', o)).join(' → ')], 'alt', 'deterministik', grp('KAB'));
      m.bagla('DONE', 'TERFI');
    }
    m.ekle('REJ', 'Rejected', [t.aktif('R43') ? 'geri alma PR\'ı + yeni iş' : '⚠ otomatik geri alma kapalı'], 'stadyum', 'hata', grp('KAB'));
    m.bagla('KAB', 'REJ', 'ret');
    if (t.aktif('R45')) {
      m.ekle('REG', 'Regresyon testi', ['hatalı sürümde kırmızı, düzeltilmişte yeşil'], 'kutu', 'ajan', grp('KAB'));
      m.bagla('REJ', 'REG', undefined, 'noktali');
    }
    if (parca === 'son') {
      m.ekle('YENI', '↩ Plane\'e yeni iş', ['ret notlarıyla'], 'stadyum', 'olay', grp('KAB'));
      m.bagla('REJ', 'YENI', undefined, 'noktali');
    } else if (t.aktif('R43')) m.bagla('REJ', 'GIR', 'yeni iş', 'noktali');
    notlariEkle(m, d, t, ['KAP', 'QA', 'RSK', 'MQ', 'DEP', 'HT', 'KAB']);
  }
  return m;
}

export function ayrintiDiyagramlari(d: Durum, t: Turetilen): Diyagram[] {
  const ilk = ayrintiModeli(d, t, 'ilk');
  const son = ayrintiModeli(d, t, 'son');
  const tam = ayrintiModeli(d, t, 'tam');
  return [
    { id: 'ayrinti1', baslik: '2 · Plane → agentic-rdd-development', aciklama: 'Talep, tetik, araştırma, plan, RED ve GREEN; kurallardan doğan karar noktaları ve yapışkan notlarla.', kod: mermaidMetni(ilk, 'TB'), notlar: ilk.notlar },
    { id: 'ayrinti2', baslik: '3 · GitHub CI/CD → alpha.example.com', aciklama: 'Kapılar, bağımsız QA, risk, birleştirme kuyruğu, alpha doğrulaması, insan testi ve kabul.', kod: mermaidMetni(son, 'TB'), notlar: son.notlar, d2: d2Metni(tam, 'down', `${t.senaryo.ad} · Ayrıntılı akış`) },
  ];
}

// ---------------- 4) Durum makinesi ----------------
export function durumDiyagrami(_d: Durum, t: Turetilen): Diyagram {
  const v = (k: string, c: string) => t.deger(k, c);
  const o = ['stateDiagram-v2', '  direction LR', '  state "Human Test" as HUMAN_TEST', '  state "WAITING_FOR_PO" as WPO'];
  o.push(`  [*] --> Todo`);
  o.push(`  Todo --> RUNNING : tetik (${temizle(secenekEtiket('tetik', t.karar('tetik')))})`);
  if (t.aktif('R01') || t.aktif('R08')) { o.push('  RUNNING --> WPO : DoR eksik / belirsizlik'); o.push('  WPO --> RUNNING : PO cevabı'); }
  if (t.aktif('R14')) { o.push('  RUNNING --> BLOCKED_TEST : RED beklenen nedenle değil'); o.push('  BLOCKED_TEST --> RUNNING : QA düzeltti'); }
  if (t.aktif('R47')) { o.push(`  RUNNING --> BLOCKED_INFRA : altyapı ${v('R47', 'tekrar')} tekrarda düzelmedi`); o.push('  BLOCKED_INFRA --> RUNNING : işletim düzeltti'); }
  o.push('  RUNNING --> VERIFYING : kod + TDD kanıtı');
  if (t.karar('qa') !== 'yok' && t.aktif('R26')) o.push(`  VERIFYING --> RUNNING : QA bulgusu, en fazla ${v('R26', 'tur')} tur`);
  if (t.aktif('R17')) o.push('  RUNNING --> ERROR : bütçe doldu');
  o.push('  VERIFYING --> READY_FOR_ALPHA : kapılar + QA + risk');
  if (t.aktif('R37')) { o.push('  READY_FOR_ALPHA --> UNKNOWN_EFFECT : dağıtım yanıtı yok'); o.push('  UNKNOWN_EFFECT --> READY_FOR_ALPHA : uzlaştırıldı'); }
  o.push(`  READY_FOR_ALPHA --> HUMAN_TEST : ${t.aktif('R35') ? 'alpha doğrulandı' : 'dağıtıldı'}`);
  o.push('  HUMAN_TEST --> Done : kabul');
  o.push('  HUMAN_TEST --> Rejected : ret');
  if (t.aktif('R43')) o.push('  Rejected --> Todo : geri alma + yeni iş');
  o.push('  Done --> [*]');
  if (t.aktif('R39')) o.push(`  note right of HUMAN_TEST : ${v('R39', 'hatirlat')} s hatırlat, ${v('R39', 'yukselt')} s yükselt`);
  if (t.aktif('R17')) o.push(`  note right of ERROR : sayaç yeni model ya da koşuyla sıfırlanmaz`);
  return { id: 'durum', baslik: '4 · Durum makinesi', aciklama: 'Görevin durumları; yalnız durum sahibi değiştirir, Plane yansıtır.', kod: o.join('\n'), notlar: [] };
}

// ---------------- 5) Sıra diyagramı ----------------
export function siraDiyagrami(d: Durum, t: Turetilen): Diyagram {
  const et = (id: string) => temizle(secenekEtiket(id, t.karar(id)));
  const qaVar = t.karar('qa') !== 'yok';
  const kanallar = ((d.kararlar.bildirim as string[]) ?? []).map((x) => secenekEtiket('bildirim', x)).join(', ') || 'yok';
  const o = [
    'sequenceDiagram', '  autonumber',
    '  actor I as İnsan (PO / geliştirici)',
    '  participant P as Plane',
    `  participant O as ${et('durumSahibi')} (durum sahibi)`,
    `  participant A as ${et('ajan')}`,
  ];
  if (qaVar) o.push(`  participant Q as QA: ${et('qa')}`);
  o.push('  participant G as GitHub CI + kuyruk', '  participant L as alpha.example.com');
  o.push('  I->>P: Görev formu (AC, risk, neyi yapma)');
  o.push(`  I->>P: ${et('tetik')}`);
  o.push('  P->>O: webhook (imzalı)');
  if (t.aktif('R03') || t.aktif('R01')) o.push(`  Note over O: ${[t.aktif('R03') && 'tekil koşu', t.aktif('R01') && 'DoR kapısı', t.aktif('R61') && 'policy sabitlendi'].filter(Boolean).join(' · ')}`);
  if (t.aktif('R01')) { o.push('  alt DoR eksik'); o.push('    O-->>P: WAITING_FOR_PO + eksik alanlar'); o.push('  end'); }
  o.push('  O->>A: araştırma ve plan (salt okunur)');
  o.push('  A-->>O: task spec + plan');
  if (t.aktif('R13')) { o.push('  opt yüksek risk'); o.push('    O->>I: plan onayı iste'); o.push('    I-->>O: onay (sinyal)'); o.push('  end'); }
  o.push('  O->>A: RED: test yaz');
  o.push(`  A-->>O: ${t.aktif('R14') ? 'RED kanıtı (doğrulama hatası)' : 'test yazıldı'}`);
  o.push('  O->>A: GREEN: kodla');
  o.push('  A->>G: PR');
  o.push('  G-->>O: kapı sonuçları (aynı SHA)');
  if (qaVar) { o.push('  O->>Q: bağımsız QA'); o.push('  Q-->>O: ölçüt başına sonuç'); }
  o.push(`  O->>G: ${t.aktif('R31') ? 'birleştirme kuyruğuna al' : 'birleştir'}`);
  o.push('  G->>L: dağıt (aynı imaj)');
  o.push(`  L-->>O: ${t.aktif('R35') ? '/_surum + /_saglik + duman' : 'dağıtım bitti'}`);
  o.push(`  O->>P: Human Test${t.aktif('R40') ? ' + test paketi' : ''}`);
  o.push(`  P->>I: bildirim (${temizle(kanallar)})`);
  if (t.aktif('R39')) o.push(`  Note over O,I: ${t.deger('R39', 'hatirlat')} s hatırlat, ${t.deger('R39', 'yukselt')} s yükselt`);
  o.push('  alt kabul');
  o.push(`    I->>P: Done${t.aktif('R41') ? ' (her madde ✓/✗ + not)' : ''}`);
  o.push('  else ret');
  o.push('    I->>P: Rejected');
  if (t.aktif('R43')) { o.push('    O->>G: geri alma PR'); o.push('    O->>P: ret notlarıyla yeni iş'); }
  o.push('  end');
  return { id: 'sira', baslik: '5 · Sıra diyagramı', aciklama: 'Kim kime ne zaman ne gönderir.', kod: o.join('\n'), notlar: [] };
}

// ---------------- 6) Her adımda geçerli kurallar ----------------
export function caprazDiyagrami(_d: Durum, t: Turetilen): Diyagram {
  const temiz = (s: string) => temizle(s).replace(/[()[\]]/g, '');
  const gruplar: [AsamaId, string][] = [['HATA', 'Hata ve toparlanma'], ['BUT', 'Bütçe ve kapasite'], ['GUV', 'Güvenlik'], ['GOZ', 'Gözlem'], ['OGR', 'Öğrenme']];
  const o = ['mindmap', '  root((Her adımda geçerli))'];
  for (const [a, ad] of gruplar) {
    o.push(`    ${temiz(ad)}`);
    const ks = t.aktifKurallar.filter((k) => k.asama === a);
    if (!ks.length) o.push('      açık kural yok');
    for (const k of ks) o.push(`      ${k.id} ${temiz(k.baslik)}`);
  }
  return { id: 'capraz', baslik: '6 · Her adımda geçerli kurallar', aciklama: 'Belirli bir aşamaya bağlı olmayan, açık kurallar.', kod: o.join('\n'), notlar: [] };
}

// ---------------- 7) Skill ve MCP havuzu ----------------
export function havuzDiyagrami(): Diyagram {
  const adim = (i: number) => `h${i}`;
  const et = (i: number) => `"\`**${temizle(HAVUZ_ADIMLARI[i].ad)}**\n${temizle(HAVUZ_ADIMLARI[i].ne)}\`"`;
  const o = ['flowchart LR'];
  o.push(`  subgraph D["Dışarıda · yalnız keşif"]`, '    direction TB', `    ${adim(0)}[(${et(0)})]:::hata`, '  end');
  o.push(`  subgraph N["Niteleme · karantinadan eval'e"]`, '    direction TB');
  for (const i of [1, 2, 3, 4]) o.push(`    ${adim(i)}[${et(i)}]:::deterministik`);
  o.push(`    ${adim(1)} --> ${adim(2)} --> ${adim(3)} --> ${adim(4)}`, '  end');
  o.push(`  subgraph C["İç katalog · sabit sürüm + özet"]`, '    direction TB', `    ${adim(5)}[(${et(5)})]:::bitti`);
  for (const i of [6, 7]) o.push(`    ${adim(i)}[${et(i)}]:::deterministik`);
  o.push(`    ${adim(5)} --> ${adim(6)} --> ${adim(7)}`, '  end');
  o.push(`  subgraph Y["Yaşam döngüsü · izle, geri çek"]`, '    direction TB');
  for (const i of [8, 9]) o.push(`    ${adim(i)}[${et(i)}]:::bekle`);
  o.push(`    ${adim(8)} --> ${adim(9)}`, '  end');
  o.push('  D -->|"yalnız aday"| N', '  N -->|"onaylı"| C', '  C -->|"kullanımda"| Y', '  Y -.->|"özet değişti: yeniden onay"| N');
  for (const [ad, s] of Object.entries(SINIFLAR))
    o.push(`  classDef ${ad} fill:${s.dolgu},stroke:${s.kenar},stroke-width:1.5px,color:${s.yazi ?? '#0b0b0b'}${s.kesik ? ',stroke-dasharray:5 3' : ''}`);
  o.push('  style D fill:#fff5f5,stroke:#e03131', '  style N fill:#f1f3f5,stroke:#868e96', '  style C fill:#ebfbee,stroke:#2f9e44', '  style Y fill:#fff9db,stroke:#f08c00');
  return { id: 'havuz', baslik: '7 · Skill ve MCP havuzu', aciklama: 'Pazar keşif kaynağıdır; güven iç katalogdan gelir.', kod: o.join('\n'), notlar: [] };
}

export function tumDiyagramlar(d: Durum, t: Turetilen): Diyagram[] {
  return [genelDiyagram(d, t), ...ayrintiDiyagramlari(d, t), durumDiyagrami(d, t), siraDiyagrami(d, t), caprazDiyagrami(d, t), havuzDiyagrami()];
}
