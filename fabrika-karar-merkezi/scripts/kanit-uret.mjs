// Araştırma dosyalarından karar desteği için "bulgu" tabanı üretir.
// İlke: yalnız olgu, ölçüm, vaka, hata kaydı, belge/kod ifadesi alınır. Öneri, sentez ve hüküm alanları alınmaz.
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const ATLA = /^(oneri|oneriler|onerilen.*|eklenmesi_onerilen.*|onerilmeyen.*|sentez|kacinilacak.*|yapilmamasi_gerekenler|hukum|d_hukum|karar|kaynak|kaynaklar|ek_kaynak|ek_kaynaklar|url|kanit_url|repo|lisans_spdx|meta|_meta|dogrulama_notlari|sinirlamalar)$/;
const ANA = ['ozet', 'deger', 'bulgu', 'not', 'cevap', 'olay', 'veri', 'sayi', 'ne', 'ne_oldu', 'madde', 'aciklama', 'tanim'];

export const TURLER = {
  pilot: 'Senin pilotun', olcum: 'Ölçüm', vaka: 'Vaka', hata: 'Hata kaydı', guvenlik: 'Güvenlik / risk', belge: 'Belge ve kod',
  akademik: 'Akademik', kurum: 'Kurum örneği', degisim: 'Değişim olayı', pano: 'Senin panoların (23.09)', ongoru: 'Öngörü (ön-ölüm)',
  olay: 'Olay kaydı', senaryo: 'Risk senaryosu', olgu: 'Olgu',
};

const ARACLAR = [
  ['temporal', /\btemporal\b/i], ['dbos', /\bdbos\b/i], ['restate', /\brestate\b/i], ['kestra', /\bkestra\b/i], ['n8n', /\bn8n\b/i],
  ['hermes', /\bhermes\b/i], ['openclaw', /openclaw|clawhub|clawhavoc|clawdbot|moltbot/i], ['openhands', /openhands/i],
  ['claude-code', /claude code|claude-code|claude -p|agent sdk|claude agent/i], ['codex-cli', /codex cli|codex exec|codex-cli|openai codex|codex app|codex sdk/i],
  ['pi', /^pi · |\bpi coding agent\b|pi-coding-agent|earendil-works\/pi\b|\bpi-mono\b|\bpi agent harness\b/i],
  ['goose', /\bgoose\b/i], ['jev', /\bjev\b|typesafe ai/i], ['pydantic', /pydantic/i], ['dspy', /\bdspy\b/i], ['langgraph', /langgraph/i],
  ['plane', /\bplane\b/i], ['github', /github/i], ['e2b', /\be2b\b/i], ['daytona', /daytona/i], ['docker', /docker|colima|cgroup/i],
  ['litellm', /litellm/i], ['symphony', /symphony/i], ['langfuse', /langfuse/i], ['playwright', /playwright/i], ['openfga', /openfga/i],
];
const KONULAR = [
  ['tetik', /webhook|in progress|\bstarted\b|state_id|state uuid|durum grub|startask|tetik|trigger|uzlaştır|reconcil|olay kutusu|issue_comment/i],
  ['durum', /durable|dayanıklı|durum sahib|iki beyin|bölünmüş|replay|yeniden oynat|event history|olay geçmiş|workflow|iş akışı|orkestrat|zombi|stale|running/i],
  ['birlestirme', /merge queue|birleştirme kuyru|squash|merge commit|fast-forward|hızlı ileri|committer|rebase|\btrunk\b|ruleset|branch protection|dal koruma|merge_group/i],
  ['insan', /insan (onay|incele|test|kabul|karar|bekle|kapasite)|human|review|inceleme|onaycı|reviewer|kabul adım|yorgun|approval/i],
  ['dogrulayici', /bağımsız (qa|doğrula|değerlendir|incele)|doğrulayıcı|verifier|judge|hakem|self-preference|değerlendirici|evaluator|üretici.doğrulayıcı|kendini düzelt/i],
  ['oracle', /oracle|altın (set|veri|test)|golden|mutasyon|mutation|reward hack|ödül istismar|test kandır|resmî örnek|resmi örnek|metamorf|property/i],
  ['sandbox', /sandbox|konteyner|container|microvm|firecracker|gvisor|\bkata\b|izolasyon|isolation|worktree|devcontainer/i],
  ['sunucu', /hetzner|ax102|ax162|\bsunucu|mac uyku|uykuya|caffeinate|\becc\b|raid|colima|lease/i],
  ['model', /spend cap|harcama tavan|rate limit|oran sınır|\b429\b|itpm|otpm|\brpm\b|\btier\b|kademe|abonelik|subscription|api anahtar|api key/i],
  ['maliyet', /maliyet|\$\s?\d|\d\s?\$|usd|€|\bcost\b|fiyat|pricing/i],
  ['guvenlik', /cve-|ghsa-|güvenlik açı|security|enjeksiyon|injection|\bsır\b|sırlar|secret|zararlı|malicious|\brce\b|\bkev\b|exfiltrat|sızıntı/i],
  ['mcp', /\bmcp\b/i], ['skill', /skill/i],
  ['yonerge', /agents\.md|claude\.md|talimat dosya|yönerge|instruction file|context file|bağlam dosya/i],
  ['bekleme', /zaman aşımı|timeout|\bp7d\b|hatırlat|escalat|yükselt|sahipsiz|bekleme/i],
  ['bellek', /\boom\b|bellek|memory|\bram\b|\bgib\b|\bexit 137\b|çıkış 137/i],
  ['olcek', /ölçek|eşzamanl|concurren|paralel|parallel|\b144\b|12 ekip|\bart\b|kademe \d/i],
  ['ortam', /\balpha\b|\bbeta\b|\brc\b|\bprod\b|önizleme|preview|deploy|dağıtım|terfi/i],
  ['bildirim', /bildirim|notification|slack|telegram|e-posta|email/i],
  ['hrms', /bordro|\bsgk\b|hrms|muhsgk|kıdem|puantaj|e-bildirge|asgari ücret|kvkk|ücret/i],
];

const temiz = (s) => String(s ?? '').replace(/\s+/g, ' ').trim();
const kisalt = (s, n = 520) => { const t = temiz(s); return t.length > n ? t.slice(0, n - 1).trimEnd() + '…' : t; };
const insan = (k) => String(k).replace(/_/g, ' ').replace(/\s*\(.*?\)\s*/g, ' ').trim();

// ---------- Öneri ayıklayıcı ----------
// Bulgu tabanına araştırmacı ve pano önerileri girmez. Belgelerin kendi teknik zorunlulukları
// ("iş akışı kodu deterministik olmalı") olgudur ve kalır. Ayıklananlar:
// 1) açık öneri kuyrukları, 2) öneri/tahmin etiketli cümlecikler,
// 3) yalnız ders kaynaklarında (Kestra pilot dersleri) "…malı/…meli" cümlecikleri.
const ONERI_KES = /\s*(?:Önerilen düzeltme|Çözüm önerisi|Gereken değişiklik)[^]*$/u;
const ONERI_ETIKET = /tahmin\/öneri|tahmin olarak önerilir|\(öneri\)|(?<!\p{L})[Öö]nerimiz/u;
const BUYURGAN = /\p{L}+(?:malı|meli|mali|malıdır|melidir|malidir)(?!\p{L})|önerilir|önerilmez|tavsiye edilir/u;
const ISTISNA = /(?<!\p{L})(?:temeli|temalı|normali|emeli)(?!\p{L})/giu;
const DERS_KAYNAGI = new Set(['KP']);
const CIDDIYET_TR = { critical: 'kritik', high: 'yüksek', medium: 'orta', moderate: 'orta', low: 'düşük' };
export function oneriAyikla(metin, kod = '') {
  let t = temiz(metin).replace(ONERI_KES, '');
  const onEk = t.match(/^[^.;:]*önerilmez:\s*/u);
  if (onEk) t = t.slice(onEk[0].length);
  const buyurgan = DERS_KAYNAGI.has(kod);
  t = t.split(/(?<=[.!?;])\s+/u)
    .filter((c) => !ONERI_ETIKET.test(c) && !(buyurgan && BUYURGAN.test(c.replace(ISTISNA, ''))))
    .join(' ').replace(/[;,]\s*$/u, '.').trim();
  return onEk ? t.charAt(0).toLocaleUpperCase('tr-TR') + t.slice(1) : t;
}

// ---------- Başlık Türkçeleştirici ----------
// Araştırma dosyalarının alan adları ASCII yazılmış (guvenlik_gecmisi). Başlıkta Türkçe gösterilir.
const TR_KELIME = Object.fromEntries(`onizleme:önizleme ortami:ortamı guvenlik:güvenlik gecmisi:geçmişi calisma:çalışma zamani:zamanı acigi:açığı
saldirisi:saldırısı celiskiler:çelişkiler tuketimi:tüketimi takilma:takılma satin:satın raporlari:raporları yurutucu:yürütücü
standartlari:standartları olcek:ölçek diger:diğer guvenligi:güvenliği kanitlari:kanıtları kaynakli:kaynaklı aylik:aylık kanit:kanıt
dagitim:dağıtım arastirma:araştırma surum:sürüm modlari:modları degisikligi:değişikliği durumlari:durumları alinti:alıntı
dogrulama:doğrulama bakim:bakım birakma:bırakma kullanim:kullanım kosullari:koşulları yuk:yük dosyalari:dosyaları bakis:bakış
ozellik:özellik gorunurluk:görünürlük buyuk:büyük oruntuleri:örüntüleri sinirlari:sınırları cakisma:çakışma olcekte:ölçekte
dogru:doğru yazilim:yazılım guvenilirligi:güvenilirliği guvenli:güvenli tasarim:tasarım ucretleri:ücretleri degerlendirmesi:değerlendirmesi
gercekleri:gerçekleri arasi:arası olcekleme:ölçekleme cikti:çıktı bilesen:bileşen dongu:döngü olculmus:ölçülmüş kullanimi:kullanımı
iddiasi:iddiası degerlendirme:değerlendirme secenek:seçenek ag:ağ sir:sır kisitlar:kısıtlar onerisi:önerisi formati:formatı gorev:görev
basi:başı butce:bütçe takilabilirligi:takılabilirliği takasina:takasına sablon:şablon ozel:özel secenekler:seçenekler oruntu:örüntü
baglami:bağlamı ayarlari:ayarları davranisi:davranışı gruplari:grupları bayraklari:bayrakları cercevesi:çerçevesi araclari:araçları
erisilebilirlik:erişilebilirlik dugum:düğüm grafigi:grafiği araci:aracı surec:süreç cokmesi:çökmesi isgucu:işgücü uygulamasi:uygulaması
tarayici:tarayıcı gorevler:görevler ozet:özet ozeti:özeti gecmis:geçmiş gunluk:günlük degisim:değişim uretim:üretim dogrulanan:doğrulanan
dogrulayici:doğrulayıcı cozum:çözüm ornek:örnek ornekler:örnekler bulgulari:bulguları akis:akış akisi:akışı sayisi:sayısı yonetimi:yönetimi
odeme:ödeme ucret:ücret baglanti:bağlantı gecis:geçiş calisan:çalışan calismasi:çalışması yontem:yöntem olcum:ölçüm sonuc:sonuç
cikis:çıkış giris:giriş acik:açık kapali:kapalı kisit:kısıt sinir:sınır oncelik:öncelik gorunum:görünüm turu:türü icin:için
ogrenilen:öğrenilen guncel:güncel guncelleme:güncelleme kucuk:küçük tum:tüm ozellikler:özellikler eszamanlilik:eşzamanlılık
ihtiyac:ihtiyaç ihtiyaclari:ihtiyaçları cikanlar:çıkanlar yuksek:yüksek dusuk:düşük onem:önem gereksinimi:gereksinimi kurallari:kuralları
disi:dışı sinirli:sınırlı dunya:dünya vakalari:vakaları kosum:koşum saglayici:sağlayıcı uyarisi:uyarısı politikasi:politikası
boyutlandirma:boyutlandırma kaniti:kanıtı basina:başına degisimi:değişimi protokolu:protokolü barindirma:barındırma sozlesmesi:sözleşmesi
destegi:desteği varsayilani:varsayılanı varsayilanlari:varsayılanları varsayilan:varsayılan arsiv:arşiv degistirilemezlik:değiştirilemezlik
surumler:sürümler omru:ömrü parcalanmasi:parçalanması gercegi:gerçeği aractan:araçtan disari:dışarı varliklari:varlıkları bagimsiz:bağımsız
bicimde:biçimde fonksiyonlari:fonksiyonları saglayicisi:sağlayıcısı
hatalari:hataları basarisizlik:başarısızlık olcu:ölçü olculer:ölçüler cozumler:çözümler gozlem:gözlem gozlemler:gözlemler`
  .split(/\s+/).filter(Boolean).map((c) => c.split(':')));
const OZEL_AD = Object.fromEntries(`ce:CE pr:PR gb:GB api:API mcp:MCP tls:TLS dns:DNS cpu:CPU cli:CLI sql:SQL k8s:K8s arc:ARC itpm:ITPM paas:PaaS
rest:REST ci:CI ui:UI llm:LLM vm:VM rss:RSS db:DB sdk:SDK ram:RAM temporal:Temporal plane:Plane github:GitHub openhands:OpenHands
hermes:Hermes symphony:Symphony hetzner:Hetzner codex:Codex goose:Goose aperant:Aperant kubernetes:Kubernetes caddy:Caddy
traefik:Traefik colima:Colima kestra:Kestra e2b:E2B daytona:Daytona docker:Docker playwright:Playwright langgraph:LangGraph
claude:Claude anthropic:Anthropic openai:OpenAI gitlab:GitLab coolify:Coolify dokploy:Dokploy firecracker:Firecracker gvisor:gVisor
sysbox:Sysbox openclaw:OpenClaw jev:Jev dbos:DBOS restate:Restate litellm:LiteLLM langfuse:Langfuse openfga:OpenFGA`
  .split(/\s+/).filter(Boolean).map((c) => c.split(':')));
const TR_IFADE = [[/\bce de\b/g, "CE'de"], [/\bbir gb\b/g, '1 GB'], [/\bnotlar riskler\b/g, 'notlar ve riskler'],
  [/\bv1 32 one cikanlar\b/g, 'v1.32 öne çıkanlar'], [/\bsql vs es\b/g, 'SQL ve ES'], [/\btraefik caddy\b/g, 'Traefik ve Caddy']];
function trParca(p) {
  const anahtar = /^[a-z0-9 \-]+$/.test(p);
  let t = anahtar ? p.replace(/-/g, ' ') : p;
  if (anahtar) for (const [rx, y] of TR_IFADE) t = t.replace(rx, y);
  t = t.replace(/(?<![\p{L}\p{N}])[a-z0-9]+(?![\p{L}\p{N}])/gu, (w) => TR_KELIME[w] ?? (anahtar ? OZEL_AD[w] ?? w : w));
  return anahtar ? t.charAt(0).toLocaleUpperCase('tr-TR') + t.slice(1) : t;
}
const trBaslik = (b) => temiz(b).split(' · ').map(trParca).join(' · ');
function ilkUrl(v) {
  if (!v) return undefined;
  if (typeof v === 'string') { const m = v.match(/https?:\/\/[^\s"'<>)\]]+/); return m ? m[0] : undefined; }
  if (Array.isArray(v)) { for (const x of v) { const u = ilkUrl(x); if (u) return u; } return undefined; }
  if (typeof v === 'object') { for (const x of Object.values(v)) { const u = ilkUrl(x); if (u) return u; } }
  return undefined;
}
function metinYap(v) {
  if (v == null) return '';
  if (typeof v === 'string') return v;
  if (typeof v === 'number' || typeof v === 'boolean') return String(v);
  if (Array.isArray(v)) return v.map(metinYap).filter(Boolean).join('; ');
  return Object.entries(v).filter(([k]) => !ATLA.test(k)).map(([k, x]) => `${insan(k)}: ${metinYap(x)}`).join('; ');
}

export function kanitlariUret(proje, veriler) {
  const oku = (...p) => JSON.parse(readFileSync(join(proje, ...p), 'utf8'));
  const ar = (f) => oku('mimari-haritasi', 'arastirma', f);
  const liste = [];
  const sayac = {};
  const ekle = (kod, tur, baslik, metin, ek = {}) => {
    const m = kisalt(oneriAyikla(metin, kod));
    if (!m || m.length < 20) return;
    sayac[kod] = (sayac[kod] ?? 0) + 1;
    liste.push({ id: `${kod}-${String(sayac[kod]).padStart(3, '0')}`, kod, tur, baslik: kisalt(trBaslik(baslik), 140), metin: m, ...ek });
  };
  // Genel düzleştirici: iç içe belge/kod olgularını tek tek bulguya çevirir.
  const duzlestir = (kod, tur, kok, onEk, dosya, ekEtiket = []) => {
    const gez = (o, yol) => {
      if (Array.isArray(o)) { o.forEach((x) => gez(x, yol)); return; }
      if (!o || typeof o !== 'object') return;
      // Nesnenin adı başlık yoluna girer (Coolify, AX102-1, "Docker Engine + runc"...). Uzun adlarda ilk parça alınır.
      const ad = ['arac', 'ad', 'isim', 'platform', 'name', 'motor', 'urun', 'model', 'secenek', 'bilesen']
        .map((k) => (typeof o[k] === 'string' ? o[k].split(/[,(;]/)[0].trim() : undefined))
        .find((v) => v && v.length > 1 && v.length <= 50);
      if (ad && !yol.includes(ad)) yol = [...yol, ad];
      const ana = ANA.find((a) => typeof o[a] === 'string' && o[a].length > 30);
      const baslik = [onEk, ...yol].filter(Boolean).map(insan).join(' · ');
      if (ana) {
        let m = o[ana];
        if (ana !== 'alinti' && typeof o.alinti === 'string') m += ` — Alıntı: “${o.alinti}”`;
        // Güvenlik bildirimi kaydı: kimlik, ciddiyet ve CVSS metnin başına gelir; türü 'guvenlik' olur.
        const bildirim = o.cvss !== undefined || typeof o.ghsa === 'string' || /^CVE-/.test(String(o.id ?? ''));
        if (bildirim) m = `${[o.id ?? o.ghsa, CIDDIYET_TR[o.ciddiyet] ?? o.ciddiyet, o.cvss !== undefined && `CVSS ${o.cvss}`, o.yamali_surum && `yamalı sürüm ${o.yamali_surum}`].filter(Boolean).join(' · ')}: ${m}`;
        const konu = typeof o.konu === 'string' ? `${baslik} · ${o.konu}` : baslik;
        ekle(kod, bildirim ? 'guvenlik' : tur, konu, m, { url: ilkUrl(o.kaynak ?? o.url ?? o.kanit_url ?? o.kaynaklar), tarih: o.tarih, dosya, ekEtiket });
      } else {
        for (const [k, v] of Object.entries(o)) {
          if (ATLA.test(k)) continue;
          if (typeof v === 'string' && v.length >= 40) ekle(kod, tur, `${baslik} · ${insan(k)}`, v, { url: ilkUrl(o.kaynak ?? o.kaynaklar), dosya, ekEtiket });
        }
      }
      for (const [k, v] of Object.entries(o)) if (v && typeof v === 'object' && !ATLA.test(k)) gez(v, [...yol, k]);
    };
    gez(kok, []);
  };

  // ---------- A0: senin pilotun ----------
  const a0 = ar('A0-mevcut-pilot.json');
  const dA0 = 'mimari-haritasi/arastirma/A0-mevcut-pilot.json';
  const sayiTr = (v) => (typeof v === 'number' ? v.toLocaleString('tr-TR') : v);
  for (const g of a0.dogrulanmis_calisanlar.gorevler) {
    const parca = [
      g.sonuc && `Sonuç: ${g.sonuc}.`,
      (g.cagri ?? g.cagri_toplam) !== undefined && `${sayiTr(g.cagri ?? g.cagri_toplam)} model çağrısı${g.cagri_kullanimi_bilinmeyen ? ` (${g.cagri_kullanimi_bilinmeyen}'ünün kullanımı bilinmiyor)` : ''}.`,
      g.onbelleksiz_girdi !== undefined && `Önbelleksiz girdi ${sayiTr(g.onbelleksiz_girdi)} token${g.toplam_girdi !== undefined ? `, toplam girdi ${sayiTr(g.toplam_girdi)}` : ''}${g.cikti !== undefined ? `, çıktı ${sayiTr(g.cikti)}` : ''}.`,
      g.sure && `Süre: ${g.sure}.`,
      g.not && `Not: ${g.not}`,
    ].filter(Boolean).join(' ');
    ekle('A0', 'pilot', `Pilot görevi · ${g.ad ?? g.id}`, parca, { dosya: dA0, kaynakMetin: g.kanit });
  }
  const bo = a0.dogrulanmis_calisanlar.basari_orani;
  ekle('A0', 'pilot', 'Pilot başarı oranı', `${bo.kok_gorev} kök görevden müdahalesiz üretime çıkan: ${bo.otonom_mudahalesiz_prod}; müdahaleyle RELEASED: ${bo.mudahaleyle_RELEASED}; RC'ye ulaşan: ${bo.RC_ye_ulasan}.`, { dosya: dA0 });
  const tz = a0.dogrulanmis_calisanlar.tum_zamanlar_toplam;
  ekle('A0', 'pilot', 'Pilotun toplam model kullanımı', `${tz.cagri} çağrı; önbelleksiz girdi ${Number(tz.onbelleksiz_girdi).toLocaleString('tr-TR')} token, çıktı ${Number(tz.cikti).toLocaleString('tr-TR')} token; kullanımı bilinmeyen çağrı ${tz.kullanimi_bilinmeyen_cagri}; para maliyeti: ${tz.para_kredi_maliyeti}.`, { dosya: dA0 });
  const km = a0.karmasiklik_olculeri;
  ekle('A0', 'pilot', 'Pilotun karmaşıklığı', `${km.factory_modul} modül, ${Number(km.satir).toLocaleString('tr-TR')} satır, ${km.fonksiyon} fonksiyon, ${km.postgres_tablo} Postgres tablosu, ${km.kestra_flow} Kestra akışı (${km.kestra_flow_satir} satır), ${km.skill} skill. Git: ${km.git?.commit} commit, ${km.git?.izlenen_dosya} izlenen dosya, ${km.git?.izlenmeyen_factory_modulu} izlenmeyen modül.`, { dosya: dA0 });
  for (const b of a0.mimari_bilesenler) ekle('A0', 'pilot', `Pilot bileşeni · ${b.ad}`, `${b.rol}`, { dosya: dA0, kaynakMetin: b.kanit });
  duzlestir('A0', 'pilot', { olculmus_kaynak_kullanimi: a0.olculmus_kaynak_kullanimi, ek_gozlemler: a0.ek_gozlemler, plane_durumlari: a0.plane_durumlari }, 'Pilot', dA0);
  for (const n of veriler.kestra.nedenler) ekle('KP', 'pilot', `${n.id} · pilot kök nedeni`, `${n.neden.replace(/[.;]?\s*$/, '.')} Etki: ${n.etki}`, { dosya: 'mimari-haritasi/pilot-dersleri.json', kaynakMetin: n.kanit });
  const e6 = ar('E6-codex-kestra-gecmisi.json');
  for (const x of e6.codex_fazlasi_eklenenler) ekle('E6', 'pilot', 'Kestra geçmişi (E6)', x.ne, { dosya: 'mimari-haritasi/arastirma/E6-codex-kestra-gecmisi.json', kaynakMetin: [x.kanit].flat().join('; ') });
  for (const x of e6.bizde_olup_codexte_olmayan) ekle('E6', 'pilot', 'Kestra geçmişi (E6)', x, { dosya: 'mimari-haritasi/arastirma/E6-codex-kestra-gecmisi.json' });

  // ---------- A1: kurum örnekleri ve akademik kanıt ----------
  const a1 = ar('A1-kurum-ornekleri.json');
  const dA1 = 'mimari-haritasi/arastirma/A1-kurum-ornekleri.json';
  for (const o of a1.ornekler)
    ekle('A1', 'kurum', `${o.kurum} · ${o.sistem}`, `Tarih: ${o.tarih}. Tetikleyici: ${metinYap(o.tetikleyici)} Orkestrasyon: ${metinYap(o.orkestrasyon)} Doğrulama: ${metinYap(o.dogrulama)} İnsan: ${metinYap(o.insan_noktalari)}`, { dosya: dA1, url: ilkUrl(o), tarih: o.tarih });
  for (const o of a1.akademik_kanit) ekle('A1', 'akademik', 'Akademik kanıt', o.bulgu, { url: ilkUrl(o.kaynak), tarih: o.tarih, dosya: dA1 });
  for (const o of a1.orkestrasyon_bulgulari) ekle('A1', 'olgu', `Orkestrasyon · ${o.konu}`, o.bulgu, { url: ilkUrl(o.kaynak), dosya: dA1 });

  // ---------- A2: platform ve kapasite (belge/kod düzeyi) ----------
  const a2 = ar('A2-platform-ve-kapasite.json');
  for (const k of Object.keys(a2)) if (!['meta', 'kaynaklar', 'sentez'].includes(k)) duzlestir('A2', 'belge', a2[k], k, 'mimari-haritasi/arastirma/A2-platform-ve-kapasite.json');
  if (a2.sentez?.bir_gb_iddiasi) duzlestir('A2', 'olgu', { bir_gb_iddiasi: a2.sentez.bir_gb_iddiasi }, 'Değerlendirme', 'mimari-haritasi/arastirma/A2-platform-ve-kapasite.json');

  // ---------- A3: talimat, skill, alt ajan, MCP, havuz ----------
  const a3 = ar('A3-havuzlar-kaizen-olgunluk.json');
  const dA3 = 'mimari-haritasi/arastirma/A3-havuzlar-kaizen-olgunluk.json';
  const a3Etiket = { talimat_dosyalari: ['yonerge'], skills: ['skill'], alt_ajanlar: ['dogrulayici'], mcp: ['mcp'], pazar_ve_havuz_degerlendirmesi: ['skill', 'mcp'], kaizen_ooda: [], olgunluk_modelleri: ['olcek'] };
  for (const [bolum, et] of Object.entries(a3Etiket)) {
    const b = a3[bolum]; if (!b) continue;
    for (const x of b.bulgular ?? []) ekle('A3', 'olgu', `${insan(bolum)} · ${x.id}`, x.bulgu, { dogrulama: x.kanit_duzeyi, dosya: dA3, ekEtiket: et, kaynakMetin: [x.kaynak].flat().join(', ') });
    for (const x of b.olaylar ?? []) ekle('A3', 'guvenlik', `${insan(bolum)} · olay`, x.olay, { tarih: x.tarih, dosya: dA3, ekEtiket: et, kaynakMetin: [x.kaynak].flat().join(', ') });
  }

  // ---------- B1: hazır projeler ----------
  const b1 = ar('B1-hazir-projeler.json');
  const dB1 = 'mimari-haritasi/arastirma/B1-hazir-projeler.json';
  for (const p of b1.projeler) {
    const d = p.durum ?? {};
    ekle('B1', 'olgu', `${p.ad} · depo durumu`, `Yıldız ${d.yildiz ?? '?'}, son push ${d.son_push ?? '?'}, arşiv: ${d.arsiv ? 'evet' : 'hayır'}, lisans ${d.lisans ?? '?'}. ${d.not ?? ''}`, { url: p.url, dosya: dB1 });
    for (const s of p.sorunlar ?? []) ekle('B1', 'hata', `${p.ad} · ${s.sinif}`, s.ozet, { url: ilkUrl(s.kanit_url), tarih: s.tarih, dosya: dB1 });
  }
  for (const g of b1.genel_bulgular) ekle('B1', 'olgu', 'Hazır projeler · genel', g.bulgu, { url: ilkUrl(g.kanit_url), dosya: dB1 });

  // ---------- B2 vakalar, B3 öngörüler ----------
  for (const s of veriler.b2.siniflar) for (const v of s.vakalar) ekle('B2', 'vaka', `${s.ad} · ${v.kim}`, v.neOldu, { tarih: v.tarih, dosya: 'mimari-haritasi/arastirma/B2-vaka-katalogu.json' });
  for (const k of veriler.b3.kipler) ekle('B3', 'ongoru', `${k.id} · ${k.sinif}`, `${k.baslik}. Nasıl bozulur: ${k.senaryo} Nasıl fark edilir: ${k.tespit} Olasılık ${k.olasilik}/5, etki ${k.etki}/5.`, { dosya: 'mimari-haritasi/arastirma/B3-on-olum.json' });

  // ---------- C1: 32 aday (gereksinim puanları olgu olarak) ----------
  const c1 = ar('C1-hazir-sistemler.json');
  const dC1 = 'mimari-haritasi/arastirma/C1-hazir-sistemler.json';
  const c1Matris = { gereksinimler: c1.gereksinimler, adaylar: [] };
  for (const a of c1.adaylar) {
    const puan = Object.fromEntries(Object.entries(a.puanlar ?? {}).map(([r, v]) => [r, typeof v === 'object' ? v.puan : v]));
    c1Matris.adaylar.push({ ad: a.ad.split(' (')[0], tam: a.ad, puan, toplam: Object.values(puan).reduce((x, y) => x + (Number(y) || 0), 0), url: a.url });
    for (const [r, v] of Object.entries(a.puanlar ?? {})) if (v && typeof v === 'object' && v.kanit)
      ekle('C1', 'olgu', `${a.ad.split(' (')[0]} · ${r} (puan ${v.puan}/2)`, `${c1.gereksinimler[r] ?? r} → ${v.kanit}`, { url: ilkUrl(v.kaynak), dosya: dC1 });
    for (const s of [a.bilinen_sorunlar].flat().filter(Boolean)) ekle('C1', 'hata', `${a.ad.split(' (')[0]} · bilinen sorun`, metinYap(s), { url: ilkUrl(s), dosya: dC1 });
    if (a.saglik) ekle('C1', 'olgu', `${a.ad.split(' (')[0]} · sağlık`, metinYap(a.saglik), { url: a.url, dosya: dC1 });
  }

  // ---------- C2, C3, C4, C5, C6 ----------
  const c2 = ar('C2-openhands-symphony-aperant.json');
  for (const k of ['openhands', 'symphony', 'aperant', 'yurutucu_standartlari']) duzlestir('C2', 'belge', c2[k], k, 'mimari-haritasi/arastirma/C2-openhands-symphony-aperant.json');
  const c3 = ar('C3-tak-cikar.json'); const dC3 = 'mimari-haritasi/arastirma/C3-tak-cikar.json';
  for (const x of c3.degisim_kanitlari) ekle('C3', 'degisim', `Değişim · ${x.katman}`, `${x.olay}. Etki: ${x.etki}`, { tarih: x.tarih, url: ilkUrl(x.kaynak), dosya: dC3 });
  for (const x of c3.ilkeler) ekle('C3', 'olgu', `İlke · ${x.ad}`, `Kanıt: ${metinYap(x.kanit)} Maliyet ve karşı kanıt: ${metinYap(x.maliyet_ve_karsi_kanit)}`, { url: ilkUrl(x.kaynak), dosya: dC3 });
  for (const x of c3.katmanlar) ekle('C3', 'olgu', `Katman oynaklığı · ${x.katman}`, `Oynaklık: ${x.oynaklik}. Kanıt: ${metinYap(x.kanit)}. Değişim testi: ${metinYap(x.degisim_testi)}`, { url: ilkUrl(x.kanit), dosya: dC3 });
  for (const x of c3.vakalar) ekle('C3', 'vaka', `Değişim vakası · ${x.ad}`, `${x.tarih}; katman ${x.katman}; ${x.ucuz_mu_pahali_mi}. ${metinYap(x.neden)}`, { tarih: x.tarih, url: ilkUrl(x.kaynak), dosya: dC3 });
  const c4 = ar('C4-buyuk-yapim-vakalari.json'); const dC4 = 'mimari-haritasi/arastirma/C4-buyuk-yapim-vakalari.json';
  for (const v of c4.vakalar) ekle('C4', 'vaka', `${v.id} · ${v.ad}`, `${v.kim}, ${v.tarih}. ${v.ne_yapildi} Boyut: ${v.boyut}. Ajanlar: ${v.ajan_sayisi_ve_yapi}. Süre: ${v.sure}. Maliyet: ${v.maliyet}. İnsan rolü: ${v.insan_rolu}`, { tarih: v.tarih, url: ilkUrl(v), dosya: dC4 });
  for (const o of c4.olcumler) ekle('C4', 'olcum', `${o.id} · ${o.ad}`, o.bulgu, { tarih: o.tarih, url: ilkUrl(o.kaynak), dosya: dC4 });
  for (const o of c4.ekip_yapisi_kanitlari) ekle('C4', 'olcum', `${o.id} · ${o.ad}`, o.bulgu, { tarih: o.tarih, url: ilkUrl(o.kaynak), dosya: dC4 });
  const c5 = ar('C5-hrms-alan-ve-oracle.json'); const dC5 = 'mimari-haritasi/arastirma/C5-hrms-alan-ve-oracle.json';
  for (const b of c5.bilinmeyen_bilinmeyenler) ekle('C5', 'olgu', `HRMS bilinmeyen ${b.sira} · risk ${b.risk}`, `${b.madde}. ${b.neden}`, { url: ilkUrl(b.kaynak), dosya: dC5, ekEtiket: ['hrms', 'oracle'] });
  const os_ = c5.oracle_sorunu;
  for (const x of os_.somut_ornekler_bu_arastirmadan) ekle('C5', 'vaka', 'Oracle · somut örnek', x.ornek, { url: ilkUrl(x.kaynak), dosya: dC5, ekEtiket: ['oracle', 'hrms'] });
  for (const x of os_.entegrasyonlar_ve_test_ortamlari) ekle('C5', 'belge', `Test ortamı · ${x.sistem}`, `Kanal: ${metinYap(x.kanal)}. Test ortamı var mı: ${metinYap(x.test_ortami_var_mi)}. Erişim: ${metinYap(x.erisim_kosulu)}`, { url: ilkUrl(x.kaynak), dosya: dC5, ekEtiket: ['oracle', 'hrms'] });
  for (const x of os_.oracle_artefaktlari) ekle('C5', 'belge', `Oracle artefaktı · ${x.artefakt}`, `Tür: ${x.tur}. Kapsadığı hesap: ${metinYap(x.kapsadigi_hesap)}. Güvenilirlik: ${x.guvenilirlik}`, { url: ilkUrl(x.kaynak), dosya: dC5, ekEtiket: ['oracle', 'hrms'] });
  for (const x of os_.sadece_insan_oracle) ekle('C5', 'olgu', `Yalnız insanın verebileceği karar · ${x.karar}`, metinYap(x.neden), { url: ilkUrl(x.kaynak), dosya: dC5, ekEtiket: ['oracle', 'insan', 'hrms'] });
  for (const x of c5.karsilastirma) ekle('C5', 'olgu', `HRMS ürünü · ${x.urun}`, `Lisans: ${metinYap(x.lisans)}. Türkiye'ye özel: ${metinYap(x.turkiye_ozel)}. Eksik: ${metinYap(x.eksik_veya_yok)}`, { url: ilkUrl(x.kaynaklar), dosya: dC5, ekEtiket: ['hrms'] });
  const c6 = ar('C6-olcek-144-ekip.json'); const dC6 = 'mimari-haritasi/arastirma/C6-olcek-144-ekip.json';
  for (const s of c6.sinirlar) ekle('C6', 'olcum', `Sınır · ${s.katman} · ${s.sinir}`, `${s.deger}`, { url: ilkUrl(s.kaynak), dosya: dC6 });
  for (const s of c6.darbogazlar) ekle('C6', 'olcum', `Darboğaz ${s.sira} · ${s.darbogaz}`, metinYap(s.sayilar), { url: ilkUrl(s.kaynak), dosya: dC6, ekEtiket: ['olcek'] });
  for (const s of c6.yapi_kanitlari) ekle('C6', 'olcum', `Yapı kanıtı · ${s.kaynak}`, s.bulgu, { url: s.url, dosya: dC6, ekEtiket: ['olcek'] });
  for (const s of c6.tuketim_verileri) ekle('C6', 'olcum', `Tüketim · ${s.kaynak_adi}`, s.veri, { url: s.url, dosya: dC6, ekEtiket: ['model', 'maliyet'] });
  for (const s of c6.trunk_kanitlari) ekle('C6', 'vaka', `Trunk · ${s.kurum}`, s.veri, { url: s.url, dosya: dC6, ekEtiket: ['birlestirme'] });
  for (const s of c6.entegrasyon_kanitlari) ekle('C6', 'olcum', `Entegrasyon · ${s.konu}`, s.veri, { url: s.url, dosya: dC6, ekEtiket: ['birlestirme'] });
  for (const s of c6.insan_kapasitesi_kanitlari) ekle('C6', 'olcum', `İnsan kapasitesi · ${s.kaynak}`, s.veri, { url: s.url, dosya: dC6, ekEtiket: ['insan'] });

  // ---------- D1, D2 hata kayıtları ----------
  for (const s of veriler.d1.siniflar) for (const k of s.kayitlar)
    ekle('D1', 'hata', `${k.motor} · ${s.ad}`, `${k.ozet} (issue durumu: ${k.durum})`, { tarih: k.tarih, url: k.kaynak, dosya: 'mimari-haritasi/arastirma/D1-orkestrator-hatalari.json', ekEtiket: ['durum'] });
  for (const s of veriler.d2.siniflar) for (const k of s.kayitlar)
    ekle('D2', 'hata', `${k.arac} · ${s.ad}`, `${k.ozet} (durum: ${k.durum})`, { tarih: k.tarih, url: k.kaynak, dosya: 'mimari-haritasi/arastirma/D2-ajan-platformu-hatalari.json' });
  for (const k of veriler.d2.dikisler) ekle('D2', 'hata', `Bağlantı noktası · ${k.dikis}`, `${k.ozet} (durum: ${k.durum})`, { tarih: k.tarih, url: ilkUrl(k.kaynak), dosya: 'mimari-haritasi/arastirma/D2-ajan-platformu-hatalari.json' });
  const d1 = ar('D1-orkestrator-hatalari.json');
  for (const m of d1.motorlar) for (const g of m.goc_hikayeleri ?? []) ekle('D1', 'vaka', `${m.ad} · göç hikâyesi`, metinYap(g), { url: ilkUrl(g), dosya: 'mimari-haritasi/arastirma/D1-orkestrator-hatalari.json', ekEtiket: ['durum'] });

  // ---------- E1–E5: Codex karşılaştırmasında doğrulanarak eklenenler ----------
  const e5 = ar('E5-codex-arastirma.json');
  for (const k of e5.konular) {
    for (const x of k.codex_fazlasi_eklenenler ?? []) ekle('E5', 'olgu', `${k.konu}`, metinYap(x.ne ?? x.bulgu ?? x), { dogrulama: x.dogrulama, url: ilkUrl(x.kaynak_url ?? x.kaynak ?? x), dosya: 'mimari-haritasi/arastirma/E5-codex-arastirma.json' });
    for (const x of k.celiskiler ?? []) ekle('E5', 'olgu', `${k.konu} · çelişki çözümü`, `${metinYap(x.konu)}: ${metinYap(x.dogru_olan ?? x.sonuc ?? '')}`, { dosya: 'mimari-haritasi/arastirma/E5-codex-arastirma.json' });
  }
  const e4 = ar('E4-codex-mimari.json');
  // E4 'celiskiler' iki eski analizin kararlarını ve 'doğru olan' hükümlerini karşılaştırır; hüküm olduğu için bulgu tabanına girmez.
  duzlestir('E4', 'olgu', { deney_kanitlari: e4.deney_kanitlari ?? e4.deneyler }, 'Mimari karşılaştırma', 'mimari-haritasi/arastirma/E4-codex-mimari.json');

  // ---------- Codex derin inceleme ve platform matrisi (salt okunur kopyalar) ----------
  for (const c of veriler.codex15) ekle('CX', 'olgu', `${c.id} · ${c.baslik}`, `Codex statik incelemesi, önem ${c.onem}. Kaçırılan: ${c.kacan} Hata zinciri: ${c.iz.map((t, i) => `(${i + 1}) ${t}`).join(' ')}`, { dosya: 'fabrika-karar-merkezi/kaynak-kopyalari/codex-15-01-kacirilan-bulgular.json' });
  const pm = JSON.parse(readFileSync(join(proje, 'fabrika-karar-merkezi', 'kaynak-kopyalari', 'codex-12-02-platform-matrisi.json'), 'utf8'));
  for (const r of pm.records ?? []) ekle('CX', 'olgu', `Codex platform matrisi · ${r.name}`, `Katman: ${r.layer}. Lisans: ${r.snapshot?.license_spdx ?? '?'}; arşiv: ${r.snapshot?.archived ? 'evet' : 'hayır'}; son commit ${String(r.snapshot?.head_commit_date ?? '').slice(0, 10)}. ${metinYap(r.shortlist_role ?? '')}`, { url: r.snapshot?.repo_url, dosya: 'fabrika-karar-merkezi/kaynak-kopyalari/codex-12-02-platform-matrisi.json' });

  // ---------- Risk haritası: araç bulguları, olay kaydı, senaryolar ----------
  for (const f of readdirSync(join(proje, 'risk-haritasi', 'araclar'))) {
    if (!f.endsWith('.json')) continue;
    const d = oku('risk-haritasi', 'araclar', f);
    for (const a of d.araclar ?? []) {
      if (a.arastirma_derinligi !== 'derin' || !veriler.riskIdleri.has(a.id)) continue;
      for (const b of a.bulgular ?? []) ekle('RH', 'guvenlik', `${a.ad} · ${b.tur} · önem ${b.siddet}`, `${b.baslik}. ${b.aciklama ?? ''}`, { tarih: b.tarih, url: ilkUrl(b.kanit_url), dogrulama: b.dogrulama, dosya: `risk-haritasi/araclar/${f}` });
    }
  }
  const olay = oku('risk-haritasi', 'olaylar', 'olay-kaydi.json');
  for (const o of olay.olaylar) ekle('OL', 'olay', `${o.olay_turu} · ${o.baslik}`, o.aciklama ?? o.baslik, { tarih: o.tarih, url: ilkUrl(o.kaynak ?? o.kanit_url ?? o), dosya: 'risk-haritasi/olaylar/olay-kaydi.json' });
  const sn = oku('risk-haritasi', 'senaryolar', 'sorun-senaryolari.json');
  for (const s of (sn.senaryolar ?? sn)) {
    const g = s.gercek_ornek && typeof s.gercek_ornek === 'object' ? s.gercek_ornek : null;
    const parca = [
      g?.aciklama && `Yaşanmış örnek${g.tarih ? ` (${g.tarih})` : ''}: ${g.aciklama}`,
      s.tetikleyici && `Tetikleyici: ${metinYap(s.tetikleyici)}`,
      s.siddet && `Şiddet: ${s.siddet}${s.olasilik ? `, olasılık: ${s.olasilik}` : ''}.`,
    ].filter(Boolean).join(' ');
    ekle('SN', 'senaryo', `${s.ayak ?? 'Risk senaryosu'} · ${s.baslik}`, parca, { url: g?.url ?? ilkUrl(s), tarih: g?.tarih, dogrulama: s.dogrulama, dosya: 'risk-haritasi/senaryolar/sorun-senaryolari.json' });
  }

  // ---------- Senin panoların (agentic-stack-docs, 23.09) ----------
  const sayfa = (f) => oku('agentic-stack-docs', 'dist', 'data', 'pages', f);
  const blokBul = (o, tip, out = []) => { if (o && typeof o === 'object') { if (o.type === tip) out.push(o); for (const v of Object.values(o)) blokBul(v, tip, out); } return out; };
  for (const [f, ad] of [['temporal.json', 'Temporal'], ['hermes.json', 'Hermes Agent'], ['jev.json', 'Jev'], ['langgraph.json', 'LangGraph'], ['crewai.json', 'CrewAI'], ['autogen.json', 'AutoGen']]) {
    for (const b of blokBul(sayfa(f), 'procon')) {
      for (const x of b.pros ?? []) ekle('PN', 'pano', `${ad} · lehte (23.09 raporu)`, metinYap(x), { dosya: `agentic-stack-docs/dist/data/pages/${f}` });
      for (const x of b.cons ?? []) ekle('PN', 'pano', `${ad} · aleyhte (23.09 raporu)`, metinYap(x), { dosya: `agentic-stack-docs/dist/data/pages/${f}` });
    }
  }
  const pb = sayfa('bulgular.json');
  const pbMetin = JSON.stringify(pb);
  for (const b of blokBul(pb, 'issues')) for (const x of b.items ?? []) ekle('PN', 'pano', `Pano tutarsızlığı · ${metinYap(x.title ?? x.baslik ?? '')}`, `${metinYap(x.text ?? x.body ?? x.desc ?? '')} ${metinYap(x.fix ? `Çözüm önerisi (23.09): ${x.fix}` : '')}`, { dosya: 'agentic-stack-docs/dist/data/pages/bulgular.json' });
  if (!pbMetin) void 0;
  for (const b of blokBul(sayfa('politika.json'), 'table')) for (const r of b.rows ?? []) if (r && typeof r === 'object' && Object.keys(r).length >= 3) {
    const deger = Object.values(r).map((x) => metinYap(typeof x === 'object' ? x.text ?? x : x)).join(' · ');
    ekle('PN', 'pano', 'Panolardaki sınırlar ve durum kodları', deger, { dosya: 'agentic-stack-docs/dist/data/pages/politika.json' });
  }
  for (const f of ['temporal.json', 'hermes.json', 'genel-bakis.json', 'ideal-kurgu.json', 'frameworkler.json', 'pipeline.json']) {
    const sf = sayfa(f);
    for (const b of blokBul(sf, 'table')) {
      const cols = (b.columns ?? []).map((c) => c.label ?? c.key);
      const keys = (b.columns ?? []).map((c) => c.key);
      for (const r of b.rows ?? []) {
        const hucreler = keys.map((kk, i) => { const v = r[kk]; const t = metinYap(v && typeof v === 'object' ? v.text ?? v : v); return t ? `${cols[i]}: ${t}` : ''; }).filter(Boolean);
        if (hucreler.length >= 2) ekle('PN', 'pano', `Pano tablosu · ${f.replace('.json', '')}`, hucreler.join(' · '), { dosya: `agentic-stack-docs/dist/data/pages/${f}` });
      }
    }
    for (const b of blokBul(sf, 'kv')) for (const it of b.items ?? []) ekle('PN', 'pano', `Pano · ${f.replace('.json', '')} · ${metinYap(it.k)}`, metinYap(it.v), { dosya: `agentic-stack-docs/dist/data/pages/${f}` });
  }
  for (const a of veriler.katalog.araclar) ekle('PN', 'pano', `Katalog · ${a.ad} (23.09 hükmü: ${a.hukum})`, `${a.ne} Bu hatta yeri: ${a.uyum} Dikkat: ${a.dikkat}`, { url: a.url, dosya: 'agentic-stack-docs/dist/data/pages/katalog.json' });

  // ---------- Etiketleme ----------
  for (const k of liste) {
    const metin = `${k.baslik} ${k.metin}`;
    const et = new Set(k.ekEtiket ?? []);
    for (const [ad, re] of ARACLAR) if (re.test(metin)) et.add(ad);
    for (const [ad, re] of KONULAR) if (re.test(metin)) et.add(ad);
    k.etiket = [...et];
    delete k.ekEtiket;
    if (!k.url) delete k.url;
    if (!k.tarih) delete k.tarih;
    if (!k.dogrulama) delete k.dogrulama;
    if (!k.kaynakMetin) delete k.kaynakMetin;
  }
  return { kanitlar: liste, c1Matris, turler: TURLER };
}
