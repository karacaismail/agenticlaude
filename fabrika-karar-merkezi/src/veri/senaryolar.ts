import type { Senaryo } from './tipler';
import { KARARLAR } from './kararlar';

const varsayilanKararlar = Object.fromEntries(KARARLAR.map((k) => [k.id, k.varsayilan])) as Record<string, string | string[]>;
const k = (ek: Record<string, string | string[]>) => ({ ...varsayilanKararlar, ...ek });

// Hazır senaryolar. Kümeler isteğe bağlıdır; kümesiz senaryo dört ana bölümle çizilir.
export const SENARYOLAR: Senaryo[] = [
  {
    id: 'tek-gorev', ad: 'Tek görev, gerçek uçtan uca', kisa: 'Tek görev · Faz 0',
    ozet: 'Tek ekip, tek proje, düşük riskli tek görev. Gerçek Plane, GitHub, model ve alpha. Yalnız Faz 0 kuralları.',
    neZaman: 'Önceki pilotta 4 kök görevden müdahalesiz üretime çıkan olmadı (A0). Gerçek Plane, GitHub ve model ile uçtan uca koşu henüz yapılmadı (devir-teslim).',
    kararlar: k({ gorunum: 'bolum' }), hedefFaz: 0,
    bulgular: [
      'Önceki pilot 7 günde 98 modüle ve ~27 bin satıra büyüdü; 17\'si örtüşen onarım/kurtarma modülüydü (A0).',
      'C6 Kademe 0 için yazılan geçiş ölçütleri: en az 30 kabul edilen PR, kabul oranı ≥ %50, PR başına CI turu medyanı ≤ 2, ajan-saat maliyeti ölçülmüş. Eşikler politika önerisi olarak işaretli (C6).',
    ],
  },
  {
    id: 'kestra-temporal-openhands', ad: 'Kestra + Temporal + OpenHands kümeleri', kisa: 'Üç teknoloji kümesi',
    ozet: 'Kestra girişi ve zamanlamayı alır, Temporal görevin durumunu tutar, OpenHands kodu yazar. Her küme bitince sıradakine geçer.',
    neZaman: 'Kestra önceki pilotta kullanıldı; Temporal ve OpenHands senin panolarında adı geçen araçlar.',
    kararlar: k({ ajan: 'openhands', qa: 'codex', gorunum: 'kume' }), hedefFaz: 1,
    kumeler: [
      { id: 'K1', ad: 'Giriş ve zamanlama', teknoloji: 'Kestra', renk: '#eb6834', devir: 'görev başlat (tekil kimlik)' },
      { id: 'K2', ad: 'Görev yaşam döngüsü', teknoloji: 'Temporal', renk: '#1baf7a', devir: 'onaylı plan' },
      { id: 'K3', ad: 'Kodlama çalışanı', teknoloji: 'OpenHands', renk: '#4a3aa7', devir: 'PR açıldı' },
      { id: 'K4', ad: 'Kapılar ve birleştirme', teknoloji: 'GitHub Actions + merge queue', renk: '#2a78d6', devir: 'birleşim SHA\'sı' },
      { id: 'K5', ad: 'alpha ve insan kabulü', teknoloji: 'alpha.example.com', renk: '#e87ba4', devir: '' },
    ],
    asamaKume: { GIR: 'K1', TET: 'K1', ARS: 'K2', HAR: 'K2', PLN: 'K2', RED: 'K3', GRN: 'K3', KAP: 'K4', QA: 'K4', RSK: 'K4', MQ: 'K4', DEP: 'K5', HT: 'K5', KAB: 'K5' },
    bulgular: [
      'Önceki pilotta Kestra 15 saniyede bir yokladı, işi Python factory_worker yaptı; durum iki yerde tutuldu (E6).',
      'Kestra\'da akış düzeyinde zaman aşımı yok; MAX_DURATION SLA var. Kestra #16198 (açık): MAX_DURATION + FAIL, worker JVM\'ini çökme döngüsüne sokuyor (E5).',
      'OpenHands: CVE-2026-33718 (yüksek); eski Python kodu 27.07.2026\'da legacy deposuna taşındı (C1, C2).',
    ],
    notlar: [
      { asama: 'TET', tur: 'dunya', metin: 'Kestra\'da akış düzeyinde zaman aşımı yok; MAX_DURATION SLA kullanılıyor', kural: 'R19', kaynak: 'E5' },
      { asama: 'GRN', tur: 'dunya', metin: 'OpenHands CVE-2026-33718 (CVSS 7,6)', kural: 'R72', kaynak: 'E5' },
    ],
  },
  {
    id: 'hermes-openclaw', ad: 'Hermes + OpenClaw kümeleri', kisa: 'Hermes Kanban · tek makine',
    ozet: 'Hermes hazırlığı ve operasyonu yapar, OpenClaw uygulamayı; durumu Hermes Kanban tutar.',
    neZaman: 'Hermes Kanban tek makinede çalışır; panondaki STARK kurallarının bir kısmına birebir karşılık gelir (Pano · Hermes).',
    kararlar: k({ durumSahibi: 'hermesKanban', ajan: 'openclaw', qa: 'codex', bildirimAraci: 'hermes', bildirim: ['plane', 'telegram'], gorunum: 'kume' }), hedefFaz: 0,
    kumeler: [
      { id: 'K1', ad: 'Hazırlık ve operasyon', teknoloji: 'Hermes Agent', renk: '#4a3aa7', devir: 'plan + test listesi' },
      { id: 'K2', ad: 'Uygulama', teknoloji: 'OpenClaw', renk: '#e34948', devir: 'PR açıldı' },
      { id: 'K3', ad: 'Kapılar ve birleştirme', teknoloji: 'GitHub Actions + merge queue', renk: '#2a78d6', devir: 'birleşim SHA\'sı' },
      { id: 'K4', ad: 'alpha ve insan kabulü', teknoloji: 'alpha.example.com', renk: '#e87ba4', devir: '' },
    ],
    asamaKume: { GIR: 'K1', TET: 'K1', ARS: 'K1', HAR: 'K1', PLN: 'K1', RED: 'K2', GRN: 'K2', KAP: 'K3', QA: 'K3', RSK: 'K3', MQ: 'K3', DEP: 'K4', HT: 'K4', KAB: 'K4' },
    bulgular: [
      'OpenClaw: 2026-01-31 ile 2026-09-11 arasında 722 güvenlik bildirimi (14 kritik, 249 yüksek); CVE-2026-25253 (CVSS 8.8); ClawHub\'daki 2.857 skill\'den 341\'i zararlıydı (risk haritası, olay kaydı, A3).',
      'Hermes Kanban: tek makine ve yerel güvenilir kullanıcı varsayımı; ardışık hata sınırı var, görev toplamı, 120 dk ve para tavanı yok; olay geçmişinden yeniden oynatma yok (Pano · Hermes).',
      'Hermes model ağırlığını değiştirmez; karmaşık işten sonra skill dosyası yazar (Pano · Hermes).',
    ],
    notlar: [
      { asama: 'GRN', tur: 'dunya', metin: 'OpenClaw: onaylanan komut sonradan farklı çalışabiliyor (onay bağı atlatma)', kural: 'R65', kaynak: 'Risk haritası BL-02496' },
      { asama: 'TET', tur: 'bilgi', metin: 'Hermes Kanban: ardışık hata sınırı var; görev bütçesi ve süre tavanı yok', kural: 'R17', kaynak: 'Pano: Hermes değerlendirmesi' },
    ],
  },
  {
    id: 'jev-kumesi', ad: 'Jev kümesi + uygulama kümesi', kisa: 'Tipli kararlar ayrı kümede',
    ozet: 'Jev, DoR evet/hayır, FE/BE yönlendirme, olgunluk ve ön triyaj kararlarını verir. Uygulama kümesinin teknolojisi seçilebilir.',
    neZaman: 'Panonda 12.000 görevlik ön triyaj ve birkaç sınıflandırıcı ajan var (Pano · Jev).',
    kararlar: k({ kararModeli: 'jev', gorunum: 'kume' }), hedefFaz: 1,
    kumeler: [
      { id: 'K1', ad: 'Tipli kararlar ve triyaj', teknoloji: 'Jev (TypeSafe AI)', renk: '#1baf7a', devir: 'DoR geçti + yönlendirme' },
      { id: 'K2', ad: 'Araştırma ve plan', teknoloji: 'Temporal + Claude Code', renk: '#4a3aa7', devir: 'onaylı plan' },
      { id: 'K3', ad: 'Uygulama kümesi (ör. Laya)', teknoloji: 'Claude Code', renk: '#eda100', devir: 'PR açıldı' },
      { id: 'K4', ad: 'Kapılar ve birleştirme', teknoloji: 'GitHub Actions + merge queue', renk: '#2a78d6', devir: 'birleşim SHA\'sı' },
      { id: 'K5', ad: 'alpha ve insan kabulü', teknoloji: 'alpha.example.com', renk: '#e87ba4', devir: '' },
    ],
    asamaKume: { GIR: 'K1', TET: 'K1', ARS: 'K2', HAR: 'K2', PLN: 'K2', RED: 'K3', GRN: 'K3', KAP: 'K4', QA: 'K4', RSK: 'K4', MQ: 'K4', DEP: 'K5', HT: 'K5', KAB: 'K5' },
    bulgular: [
      'Jev tipli karar döndüren barındırılan bir model API\'si; en fazla 255 etiket, 2–10 seviyeli ölçek, olasılıklı evet/hayır (Pano · Jev).',
      'Hız ve maliyet rakamları üretici iddiası; senin etiketlerinde ölçülmedi (Pano · Jev).',
      'Kapalı servis: görev metni ve kod parçaları dışarı çıkar (Pano · Jev).',
      '"Laya" adında bir araç kaynaklarda ve 127 araçlık katalogda bulunamadı; uygulama kümesinin teknolojisi Kümeler bölümünden değiştirilebilir.',
    ],
    notlar: [
      { asama: 'GIR', tur: 'bilgi', metin: 'Jev: güven eşiğin altındaysa karar güçlü modele ya da insana gider', kural: 'R02', kaynak: 'Pano: Jev değerlendirmesi' },
    ],
  },
  {
    id: 'etki-defteri', ad: 'Etki defteri ve nesil', kisa: 'Codex tasarımı',
    ozet: 'Dış etkiler (push, PR, dağıtım, yorum) niyet → makbuz → uzlaştırma zinciriyle yazılır. Belirsiz sonuç körlemesine tekrarlanmaz.',
    neZaman: 'Codex\'in pilotu bu tasarımı gerçek Temporal üzerinde 9 senaryoyla sınadı; model, GitHub ve dağıtım fikstürdü (E4).',
    kararlar: k({ ajan: 'codex', qa: 'claude', gorunum: 'bolum' }), hedefFaz: 1,
    kuralAcik: ['R07', 'R24', 'R36', 'R37', 'R44'],
    bulgular: [
      'Codex pilotu gerçek Temporal üzerinde 9 senaryoyu geçti: çift kabul, sonsuz onarım döngüsü olmaması, dış etkiden sonra çökmede çift yazım olmaması, belirsiz etkinin körlemesine tekrar denenmemesi (E4).',
      'Codex\'in yalnız v2 kabul eden webhook adaptörü Plane CE\'nin v1 gövdesini reddeder (E4, DE-01).',
    ],
    notlar: [
      { asama: 'DEP', tur: 'codex', metin: 'Zaman aşımı işlemin olmadığı demek değil: önce sorgula, sonra karar ver', kural: 'R37', kaynak: 'DP-12' },
    ],
  },
  {
    id: 'hrms-oracle', ad: 'HRMS modülü: önce oracle', kisa: 'Uzman imzalı kabul',
    ozet: 'Önce uzman imzalı altın veri seti ve kural → kaynak izi kurulur; geliştirme bunun üzerinde ölçülür.',
    neZaman: 'C5\'e göre HRMS\'te yalnız SGK 4/a servisinin test ortamı var; MUHSGK, e-Bildirge, banka ve BES için yok.',
    kararlar: k({ oracle: 'uzman', insanRolu: 'esUretici', gorunum: 'kume' }), hedefFaz: 1,
    kuralAcik: ['R27', 'R34', 'R67'],
    kumeler: [
      { id: 'K1', ad: 'Oracle hazırlığı', teknoloji: 'Alan uzmanı + altın veri seti', renk: '#eda100', devir: 'imzalı set + kural → kaynak izi' },
      { id: 'K2', ad: 'Geliştirme', teknoloji: 'Temporal + Claude Code', renk: '#4a3aa7', devir: 'PR açıldı' },
      { id: 'K3', ad: 'Doğrulama', teknoloji: 'Codex CLI + mutasyon + paralel koşum', renk: '#2a78d6', devir: 'birleşim SHA\'sı' },
      { id: 'K4', ad: 'alpha ve uzman kabulü', teknoloji: 'alpha.example.com', renk: '#e87ba4', devir: '' },
    ],
    asamaKume: { GIR: 'K1', TET: 'K1', ARS: 'K1', HAR: 'K2', PLN: 'K2', RED: 'K2', GRN: 'K2', KAP: 'K3', QA: 'K3', RSK: 'K3', MQ: 'K3', DEP: 'K4', HT: 'K4', KAB: 'K4' },
    bulgular: [
      'C5\'in "tamam" tanımındaki beş koşul: kapsam, doğruluk (kanun maddesi ve Resmî Gazete izi), entegrasyon, işletim, uzman imzası.',
      'C5 bilinmeyen-bilinmeyenler 1. sıra: geliştirme sırasında mevzuat değişikliği (2025-12: 7566 SGK oran/tavan; 2026-04: 7578 analık 24 hafta).',
      'C5 oracle sırasının 8. kademesi insan uzman: mali müşavir, İK hukukçusu, SGK uzmanı.',
    ],
    notlar: [
      { asama: 'HT', tur: 'bilgi', metin: '2026 asgari ücret: brüt 33.030 TL, net 28.075,50 TL (ÇSGB) — altın set örneği', kaynak: 'C5 · ÇSGB PDF' },
    ],
  },
  {
    id: 'olcek-art', ad: 'Ölçek: 12 ekip (1 ART)', kisa: 'Kademe 2',
    ozet: 'Bölünmüş iş kuyrukları, görev başına tek seferlik işçi, WIP ve bütçe sınırları. Eşzamanlılık insan inceleme kapasitesine bağlı.',
    neZaman: 'C6\'daki kademeli planın 2. kademesi: 12 eşzamanlı işçi (~1 ART).',
    kararlar: k({ bildirimAraci: 'n8n', ortamlar: ['alpha', 'beta', 'rc', 'prod'], gorunum: 'bolum' }), hedefFaz: 2,
    kuralDeger: { R42: { wip: 4 }, R57: { wip: 1 } },
    bulgular: [
      'C6 hesabı: 144 ekip ölçeğinde inceleme ve kabul için 43–144 kişi.',
      'Faros AI: yüksek yapay zekâ kullanan ekiplerde PR inceleme süresi +%91, ortalama PR boyutu +%154 (C6).',
      'n8n: Ekim 2024\'ten beri 171 güvenlik bildirimi (24 kritik); CVE-2026-21858 CVSS 10 (risk haritası).',
      'Ajan-saat maliyeti C6\'da 5–9 kat belirsizlikle verildi; gerçek değer ölçülmedi.',
    ],
    notlar: [
      { asama: 'HT', tur: 'dunya', metin: '144 ekip ölçeğinde inceleme ve kabul için 43–144 kişi gerekir', kural: 'R42', kaynak: 'C6' },
    ],
  },
];

export const senaryoBul = (id: string) => SENARYOLAR.find((s) => s.id === id) ?? SENARYOLAR[0];
