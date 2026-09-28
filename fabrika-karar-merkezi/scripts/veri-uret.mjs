// Araştırma dosyalarından (yalnız okuma) uygulamanın kullandığı tek veri dosyasını üretir:
// src/veri/uretilen.json. Kaynak dosyalara yazmaz. Sayılar elle girilmez; hepsi buradan hesaplanır.
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { kanitlariUret, oneriAyikla } from './kanit-uret.mjs';

const uygulama = join(dirname(fileURLToPath(import.meta.url)), '..');
const proje = join(uygulama, '..');
const oku = (...p) => JSON.parse(readFileSync(join(proje, ...p), 'utf8'));
const kisalt = (s, n = 280) => {
  if (!s) return '';
  const t = String(s).replace(/\s+/g, ' ').trim();
  return t.length > n ? t.slice(0, n - 1).trimEnd() + '…' : t;
};

// ---------- İhtiyaç haritası ----------
const ih = oku('ihtiyac-haritasi', '00-indeks.json');
const ist = ih.istatistik;
const ihtiyac = {
  toplam: ist.ihtiyac,
  kume: ist.kume,
  alan: ist.alan,
  zorunluluk: ist.zorunluluk,
  cember: ist.cember,
  belirsizlik: ist.belirsizlik,
  kanit: ist.kanit_duzeyi,
  celiski: ist.celiski,
  acikSoru: ist.acik_soru,
  bilinmeyen: ist.bilinmeyen_bilinmeyen,
  bosluk: ist.bosluk,
  bekleyenKarar: ist.bekleyen_karar,
  yetenekSinifi: ist.yetenek_sinifi,
};

// ---------- Araç haritası ----------
const ah = oku('arac-haritasi', '00-harita.json');
const grupSay = {};
for (const y of ah.yetenek_siniflari) grupSay[y.grup] = (grupSay[y.grup] || 0) + y.arac_sayisi;
const arac = {
  toplam: ah.araclar.length,
  dongu: ah.donguler.length,
  yetenekSinifi: ah.yetenek_siniflari.length,
  yetenekGrup: Object.entries(grupSay).map(([grup, sayi]) => ({ grup, sayi })).sort((a, b) => b.sayi - a.sayi),
  istatistik: ah.istatistik,
};

// ---------- Risk haritası ----------
const rh = oku('risk-haritasi', '00-risk-haritasi.json');
const riskIndeks = new Map(rh.arac_risk_indeksi.map((x) => [x.id, x]));
const secilenRisk = [
  'AR-0001','AR-0002','AR-0003','AR-0004','AR-0005','AR-0008','AR-0018','AR-0019','AR-0025','AR-0026','AR-0027',
  'AR-0033','AR-0034','AR-0038','AR-0039','AR-0054','AR-0055','AR-0056','AR-0057','AR-0058','AR-0060','AR-0078',
  'AR-0079','AR-0080','AR-0089','AR-0099','AR-0103','AR-0108','AR-0115','AR-0116','AR-0117','AR-0118','AR-0122',
  'AR-0127','AR-0130','AR-0131','AR-0132','AR-0134','AR-0135','AR-0148','AR-0149','AR-0150','AR-0153','AR-0154',
  'AR-0162','AR-0174','AR-0175','AR-0180','AR-0188','AR-0194','AR-0195','AR-0452','AR-0644','AR-1155','AR-1386',
  'AR-1392','AR-1912','AR-2284','AR-4043','AR-4405',
  // API istemcisi ve API testi kararları (D17)
  'AR-0948','AR-1001','AR-1025','AR-2546','AR-2547','AR-3979','AR-4406','AR-4407','AR-4408','AR-4410','AR-4413','AR-4414','AR-4415','AR-4418','AR-4421',
];
const detay = new Map();
for (const f of readdirSync(join(proje, 'risk-haritasi', 'araclar'))) {
  if (!f.endsWith('.json')) continue;
  const d = oku('risk-haritasi', 'araclar', f);
  for (const a of d.araclar || []) if (secilenRisk.includes(a.id)) detay.set(a.id, a);
}
const riskAraclar = {};
for (const id of secilenRisk) {
  const x = riskIndeks.get(id);
  if (!x) continue;
  const d = detay.get(id) || {};
  riskAraclar[id] = {
    ad: x.ad,
    puan: x.risk_puani,
    seviye: x.risk_seviyesi,
    bulgu: x.bulgu_sayisi,
    derinlik: x.arastirma_derinligi,
    turler: x.risk_turleri,
    lisans: x.lisans_sinifi,
    enOnemli: (d.en_onemli_riskler || []).slice(0, 4).map((r) => ({ id: r.id, baslik: kisalt(r.baslik, 180), siddet: r.siddet })),
    depo: d.depo ? { ad: d.depo.ad, yildiz: d.depo.yildiz, arsiv: d.depo.arsiv, sonPush: d.depo.son_push } : null,
    url: d.url || null,
  };
}
const risk = {
  toplamArac: rh.istatistik.arac,
  derin: rh.istatistik.derin_arastirilan,
  toplamBulgu: rh.istatistik.bulgu,
  siddet: rh.istatistik.bulgu_siddet,
  seviye: rh.istatistik.arac_seviye,
  olay: rh.istatistik.olay,
  senaryo: rh.istatistik.senaryo,
  turler: rh.risk_turleri.map((t) => ({ id: t.id, ad: t.ad, bulgu: t.bulgu, kritik: t.kritik, yuksek: t.yuksek })),
  enRiskli: rh.en_riskli_araclar.slice(0, 15).map((x) => ({ id: x.id, ad: x.ad, puan: x.risk_puani, seviye: x.risk_seviyesi, bulgu: x.bulgu_sayisi })),
  araclar: riskAraclar,
};

// ---------- D1: orkestratör hataları ----------
const ar = (...p) => oku('mimari-haritasi', 'arastirma', ...p);
const d1 = ar('D1-orkestrator-hatalari.json');
const d1Esle = {
  'takili/zombi calisma': 0, 'kayip gorev/olay': 1, 'zaman asimi / insan beklemesi': 2, 'tekrar/cift yan etki': 3,
  'determinizm/surumleme': 4, 'payload/durum boyutu': 5, 'LLM rate-limit / backlog': 6, 'worker OOM/kaynak': 7,
  'self-host ops / DB yuku': 8, 'yukseltme/kirici degisiklik': 9, 'gozlemlenebilirlik': 10, 'lisans/fiyat': 11,
  'iki beyin / bolunmus durum': 12,
};
const d1Adlar = [
  'Takılı / zombi / bayat RUNNING', 'Yeniden başlatmada kayıp görev veya olay', 'Zaman aşımı, uzun LLM adımı, insan beklemesi',
  'Tekrarda çift yan etki (idempotency)', 'Determinizm ve sürümleme', 'Geçmiş, yük ve durum boyutu', 'LLM oran sınırı ve kuyruk birikmesi',
  'İşçi bellek taşması ve kaynak', 'Self-host işletim ve veritabanı yükü', 'Yükseltme ve kırıcı değişiklik', 'Gözlemlenebilirlik',
  'Lisans, fiyat, sahiplik', 'İki beyin / bölünmüş durum',
];
const d1Motorlar = d1.motorlar.map((m) => m.ad.replace(' (conductor-oss / Orkes)', ''));
const d1Siniflar = d1.siniflar_arasi_ozet.map((s, i) => ({ id: `D1-${String(i + 1).padStart(2, '0')}`, ad: d1Adlar[i], tipikNeden: s.tipik_neden, motorlar: s.hangi_motorlarda, kayitlar: [] }));
const d1Matris = [];
const d1Sayac = {};
d1.motorlar.forEach((m, mi) => {
  for (const h of m.hatalar) {
    const si = d1Esle[h.sinif];
    if (si === undefined) { console.warn('D1 eşlenemedi:', h.sinif); continue; }
    d1Siniflar[si].kayitlar.push({ motor: d1Motorlar[mi], ozet: kisalt(h.ozet, 220), tarih: h.tarih, durum: h.durum, kaynak: h.kaynak });
    const k = `${mi}:${si}`; d1Sayac[k] = (d1Sayac[k] || 0) + 1;
  }
});
for (const [k, v] of Object.entries(d1Sayac)) { const [mi, si] = k.split(':').map(Number); d1Matris.push([si, mi, v]); }

// ---------- D2: ajan platformu hataları ----------
const d2 = ar('D2-ajan-platformu-hatalari.json');
const d2Adlar = ['Yanlış başarı sinyali', 'Maliyet çarpanları', 'PR seli ve yazarlık', 'CI atlatma / kırmızı testle birleştirme', 'Güvenlik', 'Kalıcı durum ve kaldığı yerden devam', 'İddia ile gerçeklik farkı', 'Bakım ve sık değişim (churn)', 'Oran sınırı'];
const d2Kural = [
  [0, /yanlis-basari|sessiz-hata|butce-dogrulama/],
  [1, /maliyet|fiyat/],
  [2, /PR-spam|yazarlik|PR-kalitesi/],
  [3, /^CI|merge/],
  [4, /guvenlik|istem-enjeksiyonu|sir|kimlik|bagimlilik-guvenligi/],
  [5, /resume|oturum|durum-deposu|is-kaybi|veri-butunlugu|zombi|iptal|takilma|zamanasimi|OOM/],
  [6, /iddia/],
  [8, /oran-siniri/],
  [7, /./],
];
const d2Araclar = d2.araclar.map((a) => a.ad);
const d2Siniflar = d2Adlar.map((ad, i) => ({ id: `D2-${String(i + 1).padStart(2, '0')}`, ad, ornekler: d2.siniflar_arasi_ozet[i]?.ornekler || [], kayitlar: [] }));
const d2Sayac = {};
d2.araclar.forEach((a, ai) => {
  for (const h of a.hatalar) {
    const si = d2Kural.find(([, re]) => re.test(h.sinif))[0];
    d2Siniflar[si].kayitlar.push({ arac: a.ad, sinif: h.sinif, ozet: kisalt(h.ozet, 220), tarih: h.tarih, durum: h.durum, kaynak: h.kaynak });
    d2Sayac[ai] = (d2Sayac[ai] || 0) + 1;
  }
});
const d2Dikisler = d2.dikis_hatalari.map((x, i) => ({ id: `D2-D${String(i + 1).padStart(2, '0')}`, dikis: x.dikis, ozet: kisalt(x.ozet, 220), tarih: x.tarih, durum: x.durum, kaynak: x.kaynak }));

// ---------- B2: vaka sınıfları, B3: ön-ölüm ----------
const b2 = ar('B2-vaka-katalogu.json');
const b2Siniflar = b2.siniflar.map((s) => ({
  id: `B2-${s.id}`, ad: s.ad, aciklama: kisalt(s.aciklama, 420),
  vakalar: s.vakalar.map((v) => ({ id: v.id, tarih: v.tarih, kim: kisalt(v.kim, 90), neOldu: kisalt(v.ne_oldu, 260) })),
}));
const b3 = ar('B3-on-olum.json');
const b3Kipler = b3.ariza_kipleri.map((x) => ({ id: x.id, sinif: x.sinif, baslik: x.baslik, oncelik: x.oncelik, senaryo: kisalt(x.senaryo, 420), tespit: kisalt(x.tespit, 240), olasilik: x.olasilik, etki: x.etki }));

// ---------- Kestra pilotu (A0 + E6) ----------
const pd = oku('mimari-haritasi', 'pilot-dersleri.json');
const kestra = {
  nedenler: pd.kok_nedenler.map((x, i) => ({ id: `KP-${String(i + 1).padStart(2, '0')}`, neden: kisalt(x.neden, 300), etki: kisalt(oneriAyikla(x.etki, 'KP'), 360), kanit: kisalt(x.kanit, 200) })),
  olculmus: pd.olculmus_kaynak_kullanimi,
};

// ---------- Codex derin inceleme (kopya) ----------
const cx = JSON.parse(readFileSync(join(uygulama, 'kaynak-kopyalari', 'codex-15-01-kacirilan-bulgular.json'), 'utf8'));
const ONEM_TR = { critical: 'kritik', high: 'yüksek', medium: 'orta', low: 'düşük' };
const codex15 = cx.records.map((r) => ({ id: r.id, baslik: r.title, onem: ONEM_TR[r.severity] ?? r.severity, kacan: kisalt(r.what_was_missed, 320), iz: (r.failure_trace ?? []).map((t) => kisalt(t, 260)) }));

// ---------- Kullanıcının araç kataloğu (agentic-stack-docs) ----------
const kd = oku('agentic-stack-docs', 'dist', 'data', 'pages', 'katalog.json');
const bul = (o) => { if (o && typeof o === 'object') { if (o.type === 'catalog') return o; for (const v of Object.values(o)) { const r = bul(v); if (r) return r; } } return null; };
const kat = bul(kd);
const norm = (s) => s.toLowerCase().replace(/\(.*?\)/g, '').replace(/[^a-z0-9ğüşöçı]+/g, ' ').trim();
const adIndeks = new Map();
for (const x of rh.arac_risk_indeksi) { const n = norm(x.ad); if (!adIndeks.has(n)) adIndeks.set(n, x); }
const katalog = {
  kategoriler: kat.categories,
  hukumler: kat.verdicts,
  araclar: kat.items.map((i) => {
    const r = adIndeks.get(norm(i.name));
    return { ad: i.name, kategori: i.cat, hukum: i.verdict, ne: i.what, uyum: i.fit, dikkat: i.caveat, lisans: i.license, url: i.url, risk: r ? { id: r.id, puan: r.risk_puani, seviye: r.risk_seviyesi } : null };
  }),
};


// ---------- Kullanıcının pano ajanları (agentic-stack-docs: ajan-haritasi) ----------
const ajd = oku('agentic-stack-docs', 'dist', 'data', 'pages', 'ajan-haritasi.json');
const tabloBul = (o) => { if (o && typeof o === 'object') { if (o.type === 'table' && Array.isArray(o.rows)) return o; for (const v of Object.values(o)) { const r = tabloBul(v); if (r) return r; } } return null; };
const ajTablo = tabloBul(ajd);
const panoAjanlari = ajTablo.rows.map((r) => ({ ajan: r.agent, panoSecimi: r.pdf, alternatif: r.alt, karar: r.verdict?.text ?? String(r.verdict), oneri: r.rec }));

const riskIdleri = new Set([...secilenRisk, ...katalog.araclar.filter((a) => a.risk).map((a) => a.risk.id)]);
const kanitVerisi = kanitlariUret(proje, { riskIdleri, kestra, b2: { siniflar: b2Siniflar }, b3: { kipler: b3Kipler }, d1: { siniflar: d1Siniflar }, d2: { siniflar: d2Siniflar, dikisler: d2Dikisler }, codex15, katalog });

const cikti = {
  uretim: { tarih: new Date().toISOString().slice(0, 10), not: 'scripts/veri-uret.mjs tarafından araştırma dosyalarından üretildi.' },
  ihtiyac, arac, risk,
  d1: { motorlar: d1Motorlar, siniflar: d1Siniflar, matris: d1Matris, toplam: d1Siniflar.reduce((a, s) => a + s.kayitlar.length, 0) },
  d2: { araclar: d2Araclar, sayac: d2Araclar.map((_, i) => d2Sayac[i] || 0), siniflar: d2Siniflar, dikisler: d2Dikisler, toplam: d2Siniflar.reduce((a, s) => a + s.kayitlar.length, 0) },
  b2: { siniflar: b2Siniflar, toplam: b2Siniflar.reduce((a, s) => a + s.vakalar.length, 0) },
  b3: { kipler: b3Kipler, enKritik: b3.en_kritik_10 },
  kestra, codex15, katalog, panoAjanlari,
  c1Matris: kanitVerisi.c1Matris,
};
writeFileSync(join(uygulama, 'src', 'veri', 'kanitlar.json'), JSON.stringify({ turler: kanitVerisi.turler, kanitlar: kanitVerisi.kanitlar }));
writeFileSync(join(uygulama, 'src', 'veri', 'uretilen.json'), JSON.stringify(cikti));
console.log('uretilen.json yazıldı:',
  `ihtiyaç ${ihtiyac.toplam}, araç ${arac.toplam}, risk bulgusu ${risk.toplamBulgu}, D1 ${cikti.d1.toplam}, D2 ${cikti.d2.toplam}+${d2Dikisler.length} dikiş,`,
  `B2 ${cikti.b2.toplam}, B3 ${b3Kipler.length}, Kestra ${kestra.nedenler.length}, Codex ${codex15.length}, katalog ${katalog.araclar.length} (risk eşleşen ${katalog.araclar.filter((a) => a.risk).length}), bulgu ${kanitVerisi.kanitlar.length}`);
