import type { Asama, BolumId } from './tipler';

// Akış: Plane → agentic-rdd-development → GitHub CI/CD → alpha.example.com
// Aşama kodları kullanıcının pano hattını izler (A0–A4, B, G, C, R, E, F, L).
export const BOLUMLER: { id: BolumId; ad: string; alt: string; renk: string }[] = [
  { id: 'plane', ad: 'Plane', alt: 'Talep, görev çerçevesi, tetik', renk: '#1baf7a' },
  { id: 'rdd', ad: 'agentic-rdd-development', alt: 'Araştırma → plan → RED → GREEN', renk: '#4a3aa7' },
  { id: 'github', ad: 'GitHub CI/CD', alt: 'Kapılar → QA → risk → birleştirme', renk: '#2a78d6' },
  { id: 'alpha', ad: 'alpha.example.com', alt: 'Dağıtım → insan testi → kabul', renk: '#eb6834' },
  { id: 'capraz', ad: 'Her adımda geçerli', alt: 'Hata, bütçe, güvenlik, gözlem, öğrenme', renk: '#52514e' },
];

export const ASAMALAR: Asama[] = [
  { id: 'GIR', bolum: 'plane', kod: 'A0', ad: 'Talep ve görev çerçevesi', aktor: 'insan', ajanlar: ['definition-of-ready', 'maturity-level'], skill: ['dor-denetimi', 'kabul-senaryosu'], mcp: ['plane'], aciklama: 'İnsan formu doldurur: problem, hikâye, kabul ölçütleri, risk, "neyi yapma".', cikti: 'Sürümlü görev çerçevesi' },
  { id: 'TET', bolum: 'plane', kod: 'A1', ad: 'Tetik', aktor: 'olay', ajanlar: [], skill: [], mcp: [], aciklama: 'Görev fabrikaya açılır; imzalı webhook tek bir koşu başlatır.', cikti: 'Koşu kimliği' },
  { id: 'ARS', bolum: 'rdd', kod: 'A2', ad: 'Araştırma ve task spec', aktor: 'ajan', ajanlar: ['R&D / task-spec', 'web-research', 'unknown-unknowns'], skill: ['etki-analizi'], mcp: ['context7', 'plane', 'github-okuma'], aciklama: 'Kod tabanı ve resmî dokümanlar okunur; belirsizlik en fazla iki turda sorulur.', cikti: 'Task spec + açık sorular' },
  { id: 'HAR', bolum: 'rdd', kod: 'A3', ad: 'İlişki haritası ve kümeleme', aktor: 'karma', ajanlar: ['module.relation.map', 'task-dependency-cluster'], skill: ['etki-analizi'], mcp: ['github-okuma'], aciklama: 'Etkilenen modüller bulunur; parçalar bağımlılığa göre kümelenir, sıra kodla belirlenir.', cikti: 'Bağımlılık grafiği ve sıra' },
  { id: 'PLN', bolum: 'rdd', kod: 'A4', ad: 'Plan ve plan incelemesi', aktor: 'ajan', ajanlar: ['planlayıcı', 'hakem (farklı model ailesi)', 'technology-boundary'], skill: ['plan-yaz', 'adr-yaz'], mcp: ['plane'], aciklama: 'Davranış listesi, riskler ve test planı yazılır; farklı aileden hakem inceler.', cikti: 'Onaylı plan' },
  { id: 'RED', bolum: 'rdd', kod: 'B', ad: 'RED: önce test', aktor: 'ajan', ajanlar: ['test-first', 'edge-case'], skill: ['tdd-red', 'kabul-senaryosu'], mcp: [], aciklama: 'Her davranış için test yazılır ve beklenen nedenle kırmızı olduğu kanıtlanır.', cikti: 'RED SHA + test raporu' },
  { id: 'GRN', bolum: 'rdd', kod: 'B', ad: 'GREEN + REFACTOR', aktor: 'ajan', ajanlar: ['uygulayıcı', 'OOP.agent', 'solid.agent', 'performance', 'documentation'], skill: ['kod-degisikligi', 'api-sozlesmesi'], mcp: ['context7'], aciklama: 'Kilitli testleri geçirecek en küçük kod yazılır, sonra sadeleştirilir.', cikti: 'Kod + PR' },
  { id: 'KAP', bolum: 'github', kod: 'G', ad: 'Deterministik kapılar', aktor: 'deterministik', ajanlar: [], skill: ['ci-teshisi'], mcp: [], aciklama: 'Burada yapay zekâ yok: build, lint, tip, testler, güvenlik taramaları.', cikti: 'SHA\'ya bağlı kapı sonuçları' },
  { id: 'QA', bolum: 'github', kod: 'C', ad: 'Bağımsız QA', aktor: 'ajan', ajanlar: ['QA ajanı (farklı sağlayıcı)'], skill: ['bagimsiz-kabul', 'diff-kapsam-inceleme'], mcp: ['playwright'], aciklama: 'Senaryolar kabul ölçütlerinden çıkarılır; kodlayıcının beyanı kanıt sayılmaz.', cikti: 'QA raporu' },
  { id: 'RSK', bolum: 'github', kod: 'R', ad: 'Risk sınıfı ve onay', aktor: 'karma', ajanlar: ['authorization (motor, ajan değil)'], skill: ['guvenlik-kontrol'], mcp: [], aciklama: 'Risk hesaplanır; yasaklı geri alınır, yüksek insana gider, orta/düşük otomatik.', cikti: 'Risk sınıfı + onay kaydı' },
  { id: 'MQ', bolum: 'github', kod: 'E', ad: 'Birleştirme kuyruğu → trunk', aktor: 'deterministik', ajanlar: ['git-scenario (ajan değil)'], skill: ['migration-provasi'], mcp: [], aciklama: 'PR, güncel ana dalla birleşik sonuç yeşilse birleşir.', cikti: 'Birleşim SHA\'sı' },
  { id: 'DEP', bolum: 'alpha', kod: 'E', ad: 'alpha dağıtımı ve doğrulama', aktor: 'deterministik', ajanlar: [], skill: ['alpha-smoke', 'etki-uzlastirma'], mcp: [], aciklama: 'Aynı imaj alpha\'ya çıkar; /_surum, /_saglik ve duman testi doğrulanır.', cikti: 'Doğrulanmış alpha sürümü' },
  { id: 'HT', bolum: 'alpha', kod: 'İnsan', ad: 'İnsan testi', aktor: 'insan', ajanlar: [], skill: ['kanit-paketi'], mcp: ['plane'], aciklama: 'Yolculuk, olumsuz senaryo, rastgele etkileşim, veritabanı yansıması, "başka?".', cikti: 'Madde madde test sonucu' },
  { id: 'KAB', bolum: 'alpha', kod: 'F', ad: 'Kabul / ret ve geri besleme', aktor: 'insan', ajanlar: ['test ajanı (regresyon)'], skill: ['kanit-paketi'], mcp: ['plane'], aciklama: 'Done ya da Rejected; ret geri alma ve yeni iş üretir.', cikti: 'Done ya da yeni iş' },
  { id: 'HATA', bolum: 'capraz', kod: '—', ad: 'Hata, tıkanıklık, toparlanma', aktor: 'deterministik', ajanlar: ['tıkanıklık çözücü'], skill: ['devir-paketi', 'etki-uzlastirma'], mcp: [], aciklama: 'Hata sınıfı, sahibi ve rotası; sahipsiz bekleme yok.', cikti: 'Doğru sahibe yönlenmiş iş' },
  { id: 'BUT', bolum: 'capraz', kod: '—', ad: 'Bütçe ve kapasite', aktor: 'deterministik', ajanlar: [], skill: [], mcp: [], aciklama: 'Deneme, süre, para ve eşzamanlılık sınırları.', cikti: 'Sert sınırlar' },
  { id: 'GUV', bolum: 'capraz', kod: '—', ad: 'Güvenlik', aktor: 'deterministik', ajanlar: [], skill: ['guvenlik-kontrol'], mcp: [], aciklama: 'Çıkış izin listesi, sırlar, yıkıcı işlem engeli, iç katalog.', cikti: 'Engellenen riskli işlem' },
  { id: 'GOZ', bolum: 'capraz', kod: '—', ad: 'Gözlem ve kanıt', aktor: 'deterministik', ajanlar: [], skill: [], mcp: ['gozlem-okuma'], aciklama: 'Görev başına maliyet, iz, yedek ve tatbikat.', cikti: 'Ölçülmüş koşu' },
  { id: 'OGR', bolum: 'capraz', kod: 'L', ad: 'Öğrenme ve yönerge iyileştirme', aktor: 'karma', ajanlar: ['iyileştirme deneycisi'], skill: ['olaydan-eval'], mcp: [], aciklama: 'Kural ve skill değişikliği ölçülerek girer; kademeli açılır.', cikti: 'Eval\'den geçmiş değişiklik' },
];

export const AKIS_SIRASI = ASAMALAR.filter((a) => a.bolum !== 'capraz').map((a) => a.id);
export const asamaBul = (id: string) => ASAMALAR.find((a) => a.id === id)!;
