import veri from './uretilen.json';
import type { Sorun, SorunKaynak } from './tipler';

// Sorun kataloğu: senin Kestra pilotun, dünyadaki kayıtlar, ön-ölüm ve Codex'in derin incelemesi.
// Metinler araştırma dosyalarından gelir (scripts/veri-uret.mjs). Kestra başlıkları kısaltılmıştır.
export const KAYNAK_ADI: Record<SorunKaynak, string> = {
  kestra: 'Senin Kestra pilotun',
  d1: 'Dünya: orkestratör hataları',
  d2: 'Dünya: ajan platformu hataları',
  d2d: 'Dünya: bağlantı noktası (dikiş) hataları',
  b2: 'Dünya: vaka sınıfları',
  b3: 'Ön-ölüm: öngörülen arızalar',
  codex: 'Codex derin inceleme',
};

export const KAYNAK_DOSYA: Record<SorunKaynak, string> = {
  kestra: 'mimari-haritasi/pilot-dersleri.json',
  d1: 'mimari-haritasi/arastirma/D1-ozet.md',
  d2: 'mimari-haritasi/arastirma/D2-ozet.md',
  d2d: 'mimari-haritasi/arastirma/D2-ozet.md',
  b2: 'mimari-haritasi/arastirma/B2-ozet.md',
  b3: 'mimari-haritasi/arastirma/B3-ozet.md',
  codex: 'fabrika-karar-merkezi/kaynak-kopyalari/codex-15-01-kacirilan-bulgular.json',
};

const KESTRA_BASLIK = [
  'Dayanıklılık elle yazıldı; Kestra yalnız yoklayıcıydı ("iki beyin")',
  'Canlı sistem sürüm kontrolü olmadan yamalandı',
  'Kapsam patlaması: 7 günde SAFe, ECA, Kaizen, çoklu sağlayıcı',
  'Kabul/oracle problemi: paket yeşili ürün kabulüne dönüşmedi',
  'Sağlayıcı ve hesap kapasitesi darboğazı',
  'Mac uykusu üretimi ve kiralamaları kırdı',
  'Bütçe ve tekrar sınırları uyarıya dönüştü',
  'Eşzamanlılık verime dönüşmedi; durum doğruluğu zayıf',
  'Çağrılar arasında bağlam devamı yok',
  '1 GiB tarayıcı test konteyneri bellek taşması',
  'Uzun test "takıldı" sanılıp öldürüldü',
  'Hata sınıfı alt dize eşlemesiyle; ilerlemesiz döngü',
  'Sahipsiz bekleme: saatlerce boş bekleyen işler',
  'Çağrının bitmesi başarı sayıldı',
  'İnsan onayı 7 gün sahipsiz bekledi (P7D)',
  'Paket bağımlılığı ve entegrasyon hazırlığı modellenmedi',
  'Canlı onarım üretici/tüketici sözleşmesini bozdu',
  'Kapasite yanlış rolden ölçüldü',
  'Hata sahibi yönlendirmesi yanlıştı',
  'Kurulum yapılandırması başlatmadan önce doğrulanmadı',
];

// Kestra kök nedenlerinin grafikte kullanılan kategorileri (6 grup).
export const KESTRA_KATEGORI: Record<string, string> = {
  'KP-01': 'Durum ve orkestrasyon', 'KP-08': 'Durum ve orkestrasyon', 'KP-14': 'Durum ve orkestrasyon',
  'KP-02': 'İşletim ve değişiklik', 'KP-06': 'İşletim ve değişiklik', 'KP-17': 'İşletim ve değişiklik', 'KP-20': 'İşletim ve değişiklik',
  'KP-03': 'Kapsam, oracle, entegrasyon', 'KP-04': 'Kapsam, oracle, entegrasyon', 'KP-16': 'Kapsam, oracle, entegrasyon',
  'KP-05': 'Kapasite, bütçe, kaynak', 'KP-07': 'Kapasite, bütçe, kaynak', 'KP-10': 'Kapasite, bütçe, kaynak', 'KP-18': 'Kapasite, bütçe, kaynak',
  'KP-09': 'Takılma ve hata yönetimi', 'KP-11': 'Takılma ve hata yönetimi', 'KP-12': 'Takılma ve hata yönetimi', 'KP-19': 'Takılma ve hata yönetimi',
  'KP-13': 'İnsan beklemesi', 'KP-15': 'İnsan beklemesi',
};

// Kuralla değil kararla önlenen sorunlar; kural gerektirmeyen araştırma-yöntemi bulguları.
export const KARARLA_ONLENEN: Record<string, { karar: string; deger: string; aciklama: string }> = {
  'KP-06': { karar: 'calismaYeri', deger: 'sunucu', aciklama: 'Sunucuda çalışma kararıyla önlenir.' },
};
export const KURAL_GEREKMEZ: Record<string, string> = {
  'DE-03': 'Geçmiş Kestra koşusuna ait tarihsel kayıt.',
  'DE-04': 'Araştırma verisi kalitesi (önem derecesinin kaynağı).',
  'DE-05': 'Araştırma verisi kalitesi (sürüm aralıkları).',
  'DE-08': 'Araştırma yöntemi (türetilmiş kaynak bağımsız olay sayılmaz).',
};

const iki = (n: number) => String(n).padStart(2, '0');

export const SORUNLAR: Sorun[] = [
  ...veri.kestra.nedenler.map((n, i): Sorun => ({
    id: n.id, kaynak: 'kestra', baslik: KESTRA_BASLIK[i] ?? n.neden, ozet: n.etki, ayrinti: n.neden,
    kayitlar: [{ baslik: 'Kanıt', alt: n.kanit }],
  })),
  ...veri.d1.siniflar.map((s): Sorun => ({
    id: s.id, kaynak: 'd1', baslik: s.ad, ozet: s.tipikNeden, kayitSayisi: s.kayitlar.length,
    ayrinti: `Görülen motorlar: ${s.motorlar.join(', ')}`,
    kayitlar: s.kayitlar.map((k) => ({ baslik: `${k.motor}: ${k.ozet}`, alt: `${k.tarih} · ${k.durum}`, url: k.kaynak })),
  })),
  ...veri.d2.siniflar.map((s): Sorun => ({
    id: s.id, kaynak: 'd2', baslik: s.ad, ozet: s.ornekler.length ? `Örnekler: ${s.ornekler.join(', ')}` : 'Ajan platformlarında görülen sınıf.',
    kayitSayisi: s.kayitlar.length,
    kayitlar: s.kayitlar.map((k) => ({ baslik: `${k.arac}: ${k.ozet}`, alt: `${k.tarih} · ${k.durum}`, url: k.kaynak })),
  })),
  ...veri.d2.dikisler.map((d): Sorun => ({
    id: d.id, kaynak: 'd2d', baslik: d.dikis, ozet: d.ozet,
    kayitlar: [{ baslik: `${d.tarih} · ${d.durum}`, url: d.kaynak.split(' ; ')[0] }],
  })),
  ...veri.b2.siniflar.map((s): Sorun => ({
    id: s.id, kaynak: 'b2', baslik: s.ad, ozet: s.aciklama, kayitSayisi: s.vakalar.length,
    kayitlar: s.vakalar.map((v) => ({ baslik: `${v.kim}: ${v.neOldu}`, alt: v.tarih })),
  })),
  ...veri.b3.kipler.map((k): Sorun => ({
    id: k.id, kaynak: 'b3', baslik: k.baslik, ozet: k.senaryo,
    ayrinti: `Nasıl fark edilir: ${k.tespit} · olasılık ${k.olasilik}/5, etki ${k.etki}/5 · sınıf: ${k.sinif} · ön-ölüm önceliği: ${k.oncelik === 'mvp-oncesi' ? 'ilk koşudan önce' : k.oncelik}`,
  })),
  ...veri.codex15.map((c): Sorun => ({
    id: c.id, kaynak: 'codex', baslik: c.baslik, ozet: c.kacan, ayrinti: `Önem: ${c.onem}`,
    kayitlar: c.iz.map((t, i) => ({ baslik: `Hata zinciri, adım ${i + 1}`, alt: t })),
  })),
];

export const sorunBul = (id: string) => SORUNLAR.find((s) => s.id === id);
export const kestraKimlik = (i: number) => `KP-${iki(i)}`;
