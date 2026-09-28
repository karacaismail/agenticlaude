import type { YapiskanNot } from './tipler';

// Diyagramdaki yapışkan notlar (FigJam benzeri). Her not bir önlem kuralına bağlıdır:
// kural açıksa "✓ önlem açık", kapalıysa "⚠ önlem kapalı" yazar.
export const TEMEL_NOTLAR: YapiskanNot[] = [
  { asama: 'GIR', tur: 'kestra', metin: 'Genel kabul isteği ve "dosya var" kanıt sanıldı; 73 paket birleşti, ürün kabul edilemedi', kural: 'R01', kaynak: 'KP-04' },
  { asama: 'TET', tur: 'kestra', metin: 'Kestra 15 sn\'de bir yokladı, işi elle yazılmış Python yaptı: "iki beyin"', kural: 'R54', kaynak: 'KP-01 · E6' },
  { asama: 'TET', tur: 'dunya', metin: 'Plane CE 5xx\'i yeniden denemiyor; 5 ağ hatasında webhook\'u kapatıyor', kural: 'R05', kaynak: 'Plane CE v1.4.2' },
  { asama: 'TET', tur: 'codex', metin: 'Gecikmiş eski bir In Progress olayı yeni koşu açabiliyor', kural: 'R03', kaynak: 'DP-05' },
  { asama: 'ARS', tur: 'dunya', metin: 'Güvenilmeyen metin talimat gibi okunursa sır sızar ya da kod çalışır', kural: 'R09', kaynak: 'B2 S05' },
  { asama: 'HAR', tur: 'kestra', metin: 'Ortak temel eskiyince birleşmiş bütün paketler bayat sayıldı', kural: 'R11', kaynak: 'KP-16' },
  { asama: 'PLN', tur: 'codex', metin: '7 parçalı planın 6\'sı alınınca 7. yükümlülük sessizce kayboluyor', kural: 'R12', kaynak: 'DP-08' },
  { asama: 'PLN', tur: 'dunya', metin: 'Aynı aileden hakem kendi model ailesini kayırıyor', kural: 'R13', kaynak: 'Pano bulguları' },
  { asama: 'RED', tur: 'dunya', metin: 'METR: RE-Bench koşularının %30,4\'ünde ödül istismarı; değerlendirici yamandı', kural: 'R15', kaynak: 'B2 S01' },
  { asama: 'GRN', tur: 'kestra', metin: 'Uzun entegrasyon testi "takıldı" sanılıp 3 kez öldürüldü', kural: 'R18', kaynak: 'KP-11' },
  { asama: 'GRN', tur: 'kestra', metin: 'Bütçe sınırları uyarıya dönüştü: 46 ERROR, 47 yeniden başlatma', kural: 'R17', kaynak: 'KP-07' },
  { asama: 'KAP', tur: 'dunya', metin: 'Ajan iş yapmadan "exit 0 / success" döndü (Factory, Open SWE, Gas Town)', kural: 'R22', kaynak: 'D2' },
  { asama: 'KAP', tur: 'codex', metin: 'Sır taraması bulgusu "|| echo" ile başarıya çevrildi', kural: 'R25', kaynak: 'DP-01' },
  { asama: 'QA', tur: 'dunya', metin: 'Ajan 54 döngüde iyileşme iddia etti; %56\'sında değişim sıfır ya da negatif', kural: 'R26', kaynak: 'A3' },
  { asama: 'RSK', tur: 'dunya', metin: 'Panoda "yasaklı" risk otomatik düzeltme döngüsüne gidiyordu', kural: 'R29', kaynak: 'Pano bulguları' },
  { asama: 'MQ', tur: 'dunya', metin: 'Yönetici yetkisiyle CI atlatılıp kırmızı testle birleştirildi', kural: 'R31', kaynak: 'D2 (Gas Town #4442)' },
  { asama: 'MQ', tur: 'bilgi', metin: 'GitHub squash/merge commit: committer "GitHub" olur', kural: 'R32', kaynak: 'AK-42' },
  { asama: 'DEP', tur: 'codex', metin: 'Yavaş eski CI, hızlı yeni sürümden sonra alpha\'yı geri taşıyabiliyor', kural: 'R36', kaynak: 'DP-10' },
  { asama: 'DEP', tur: 'kestra', metin: '1 GiB tarayıcı test konteyneri OOM; 2g\'de geçti, ~150 testte yine yetmedi', kural: 'R48', kaynak: 'KP-10 · E6' },
  { asama: 'HT', tur: 'kestra', metin: 'Kabul 7 gün sahipsiz bekledi; P7D ile KESTRA_FAILED', kural: 'R39', kaynak: 'KP-15' },
  { asama: 'HT', tur: 'dunya', metin: 'Onaycılar yorulup otomatik onaya kayıyor', kural: 'R42', kaynak: 'B2 S13' },
  { asama: 'KAB', tur: 'codex', metin: 'Durum yazımı ile insan reddi yarışınca ret "eski" diye düşebiliyor', kural: 'R44', kaynak: 'DP-07' },
  { asama: 'KAB', tur: 'kestra', metin: 'Dokuz durmanın hepsi kullanıcı "bitti mi?" diye sorunca fark edildi', kural: 'R49', kaynak: 'KP-13' },
];

export const NOT_TURU: Record<string, { ad: string; dolgu: string; kenar: string }> = {
  kestra: { ad: 'Kestra\'da yaşadın', dolgu: '#FFD8A8', kenar: '#E8590C' },
  dunya: { ad: 'Dünyada yaşandı', dolgu: '#FFF3A3', kenar: '#C9A400' },
  codex: { ad: 'Codex buldu', dolgu: '#D0EBFF', kenar: '#1C7ED6' },
  bilgi: { ad: 'Bilgi', dolgu: '#E6FCF5', kenar: '#0CA678' },
};
