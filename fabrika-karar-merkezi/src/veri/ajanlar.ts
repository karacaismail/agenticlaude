import type { AsamaId } from './tipler';

// Ajanlar, skill'ler, skill çerçeveleri, havuz (skill veritabanından besleme) ve MCP.
// Kaynaklar: A3 (havuzlar, skill, MCP), kullanıcının pano ajan haritası, Codex rol/skill şablonları.

export const ONERILEN_YAPI = {
  ozet: 'Tek ana ajan + keşif alt ajanı + bağımsız değerlendirici (farklı model ailesi; deterministik kapılar önce) + gerekirse güvenlik inceleyici ve planlayıcı.',
  maddeler: [
    'Alt ajan şuralarda fayda sağlar: bağlam yalıtımı (keşif, log ve test özetleme), araç kısıtı, bağımsız doğrulama.',
    'Çoklu ajan yaklaşık 15 kat token harcar; kodlama işi araştırmaya göre daha az paralelleşir.',
    'Persona ve rol oyunu başarımı artırmıyor. "Scrum Master ajanı" ya da "RTE ajanı"nın faydasını gösteren kontrollü çalışma bulunamadı.',
    'SAFe rolleri insanlarda kalır; ajan olay örüntüleri Inspect & Adapt\'te insanlar tarafından ele alınır.',
  ],
  kaynak: 'A3 §3',
};

export const CODEX_ROLLERI = [
  { id: 'AR01', ad: 'İş sözleşmesi yorumlayıcısı', evre: 'MVP' },
  { id: 'AR02', ad: 'Sınırlandırılmış planlayıcı', evre: 'MVP' },
  { id: 'AR03', ad: 'Uygulayıcı', evre: 'MVP' },
  { id: 'AR04', ad: 'Bağımsız kabul doğrulayıcısı', evre: 'MVP' },
  { id: 'AR05', ad: 'Bağımsız değişiklik inceleyicisi', evre: 'MVP' },
  { id: 'AR06', ad: 'UX ve erişilebilirlik uzmanı', evre: 'Koşullu' },
  { id: 'AR07', ad: 'Güvenlik uzmanı', evre: 'Koşullu' },
  { id: 'AR08', ad: 'Veri değişikliği uzmanı', evre: 'Koşullu' },
  { id: 'AR09', ad: 'Bağımlılık ve entegrasyon analisti', evre: 'Koşullu' },
  { id: 'AR10', ad: 'Kaynak araştırmacısı', evre: 'Koşullu' },
  { id: 'AR11', ad: 'Hata teşhisçisi', evre: 'Koşullu' },
  { id: 'AR12', ad: 'İyileştirme deneycisi', evre: 'MVP sonrası' },
];

export const TERMINAL_SONUCLAR = [
  { ad: 'ready_for_review', ne: 'Kapılar aynı SHA\'da yeşil, alpha doğrulandı; insan kabulünü bekliyor' },
  { ad: 'needs_input', ne: 'Kritik bilgi eksik; soru sahibine gitti' },
  { ad: 'policy_blocked', ne: 'İstenen işlem izin dışında' },
  { ad: 'failed', ne: 'Deneme ya da bütçe sınırı doldu; kanıt paketi hazır' },
  { ad: 'cancelled', ne: 'İnsan iptal etti; yeni dış etki yetkisi yok' },
  { ad: 'unknown_effect', ne: 'Dış etkinin sonucu bilinmiyor; uzlaştırma bekliyor' },
];

export interface SkillOnerisi { id: string; ad: string; asama: AsamaId; ne: string; kaynak: string }
// 20'yi geçmemek için 18 skill (A3: 20 skill'e kadar seçim doğruluğu %90'ın üstünde).
export const SKILLER: SkillOnerisi[] = [
  { id: 'dor-denetimi', ad: 'DoR / DoD denetimi', asama: 'GIR', ne: 'Görev çerçevesinin alanlarını ve somut değerleri denetler.', kaynak: 'A3 · Codex SK01' },
  { id: 'kabul-senaryosu', ad: 'Kabul senaryosu ve olumsuz örnek', asama: 'GIR', ne: 'Her AC için Verilen/Olduğunda/O zaman ve en az bir olumsuz örnek.', kaynak: 'Codex SK02' },
  { id: 'etki-analizi', ad: 'Repo keşfi ve etki analizi', asama: 'ARS', ne: 'Etkilenen modül, API ve veri modelini çıkarır; kod grafiğiyle.', kaynak: 'Codex SK03' },
  { id: 'plan-yaz', ad: 'Sınırlandırılmış değişiklik planı', asama: 'PLN', ne: 'Davranış listesi, riskler, test planı; kapsam dışını yazar.', kaynak: 'Codex SK04' },
  { id: 'adr-yaz', ad: 'ADR taslağı', asama: 'PLN', ne: 'Teknoloji sınırı kararını Nygard biçiminde önerir.', kaynak: 'A3' },
  { id: 'tdd-red', ad: 'TDD RED', asama: 'RED', ne: 'Başarısız testi yazar, beklenen nedenle kırmızı olduğunu kanıtlar.', kaynak: 'Codex SK06 · Pano B' },
  { id: 'kod-degisikligi', ad: 'Kod değişikliği', asama: 'GRN', ne: 'Kilitli testleri geçirecek en küçük değişiklik, sonra sadeleştirme.', kaynak: 'Codex SK05' },
  { id: 'api-sozlesmesi', ad: 'API sözleşmesi ve feature flag', asama: 'GRN', ne: 'Depoya özgü prosedür: sözleşme dosyası, bayrak, bitiş tarihi.', kaynak: 'A3 (depo prosedürleri)' },
  { id: 'ci-teshisi', ad: 'CI hata teşhisi', asama: 'KAP', ne: 'Kırmızı kapının sınıfını ve sahibini bulur (ortam / test / ürün).', kaynak: 'Codex SK14' },
  { id: 'bagimsiz-kabul', ad: 'Bağımsız kabul değerlendirmesi', asama: 'QA', ne: 'Senaryoları AC\'den çıkarır; kodlayıcının beyanını kanıt saymaz.', kaynak: 'Codex SK08' },
  { id: 'diff-kapsam-inceleme', ad: 'Açıklama–fark tutarlılığı', asama: 'QA', ne: 'PR açıklaması ile değişen kodu karşılaştırır.', kaynak: 'A3 · Codex SK09' },
  { id: 'guvenlik-kontrol', ad: 'Güvenlik kontrol listesi', asama: 'RSK', ne: 'Tarama bulgularını yorumlar; hassas yolları işaretler.', kaynak: 'A3 · Codex SK10' },
  { id: 'migration-provasi', ad: 'Göç provası ve geri alma', asama: 'MQ', ne: 'Göçü ve geri almayı temiz veritabanında dener.', kaynak: 'A3 · Codex SK13' },
  { id: 'alpha-smoke', ad: 'alpha duman testi ve sürüm kimliği', asama: 'DEP', ne: '/_surum, /_saglik ve kısa duman testini doğrular.', kaynak: 'Codex SK16' },
  { id: 'etki-uzlastirma', ad: 'İptal ve dış etki uzlaştırma', asama: 'DEP', ne: 'Belirsiz push/dağıtımda önce durumu sorgular, deftere yazar.', kaynak: 'Codex SK18' },
  { id: 'kanit-paketi', ad: 'Kanıt paketi ve kullanıcı özeti', asama: 'HT', ne: 'İnsan testçiye madde madde paket ve kısa özet hazırlar.', kaynak: 'Codex SK17' },
  { id: 'devir-paketi', ad: 'Şemalı devir paketi', asama: 'HATA', ne: 'Ne denendi, neden kaldı, kanıt: onarım ajanına aktarılır.', kaynak: 'A3 · Codex SK19' },
  { id: 'olaydan-eval', ad: 'Olaydan eval vakası', asama: 'OGR', ne: 'Her olaydan sabit eval kümesine örnek üretir.', kaynak: 'A3 · Codex SK20/SK21' },
];

export const SKILL_CERCEVELERI = [
  { ad: 'Agent Skills açık standardı', ne: 'SKILL.md: ad + açıklama başlığı, gövde, isteğe bağlı betik ve ek dosyalar. Açılışta ~100 token, gövde gerektiğinde.', nasil: 'Biçim ve kademeli yükleme kuralı. Depo: agentskills/agentskills.', kaynak: 'A3-K11, K12, K22' },
  { ad: 'anthropics/skills ve skill-creator', ne: 'Resmî örnek skill\'ler. skill-creator skill\'i yeni skill yazar, değiştirir ve başarımını ölçer.', nasil: 'Taslak üret → sabit örneklerle ölç → iç kataloğa öner.', kaynak: 'A3 · Claude\'da yerleşik skill' },
  { ad: 'openai/skills', ne: 'Codex tarafının resmî skill deposu.', nasil: 'Codex ile aynı biçim; iki çalıştırıcıda aynı skill\'i sınamak için.', kaynak: 'A3' },
  { ad: 'SkillsBench (ölçüm)', ne: 'Özenle yazılmış skill başarıyı +16,6 puan artırdı; en fazla 3 modüllü odaklı skill\'ler daha iyi; modelin kendi ürettiği skill\'ler ortalamada fayda sağlamadı.', nasil: 'Skill\'i yazmadan önce ölçüt belirle; üretilen skill\'i eval\'siz alma.', kaynak: 'A3-K16' },
  { ad: 'Promptfoo / Inspect (eval)', ne: 'Skill ve yönerge değişikliğini sabit örnek kümesinde karşılaştırır.', nasil: 'Eski ve yeni sürümü aynı örneklerle k kez koştur; iyileşme yoksa alma (R70).', kaynak: 'Kullanıcı kataloğu: Promptfoo önerilen, Inspect aday' },
  { ad: 'Hermes öğrenme döngüsü', ne: 'Hermes karmaşık bir işten sonra skill dosyası yazar; model ağırlığı değişmez (Reflexion kökenli).', nasil: 'Yalnız öneri modunda: PR → eval → insan onayı → birleştirme. Skill dizini bir git deposu olur.', kaynak: 'Pano: Hermes değerlendirmesi' },
];

// Skill'lerin "veritabanından" beslenmesi: pazar keşiftir, güven iç katalogdan gelir.
export const HAVUZ_ADIMLARI = [
  { ad: 'Keşif', ne: 'Pazar ve kayıtlar (skills.sh, ClawHub, MCP Registry, mcpmarket) yalnız aday kaynağıdır.' },
  { ad: 'Karantina', ne: 'Aday ayrı bir kum havuzunda, ağsız ve sırsız çalışır.' },
  { ad: 'İnceleme', ne: 'Kaynak adresi, sürüm/özet, lisans, sahip, izinler, ağ kapsamı, sır referansları.' },
  { ad: 'Sözleşme testi', ne: 'Girdi/çıktı sözleşmesi ve yetki sınırı otomatik sınanır.' },
  { ad: 'Bağımsız eval', ne: 'Sabit örnek kümesinde eski sürümle karşılaştırılır.' },
  { ad: 'İç katalog', ne: 'Sürüm ve içerik özeti sabitlenir; özet değişirse yeniden onay.' },
  { ad: 'Rol profili', ne: 'Paket yalnız ilgili role ve projeye açılır.' },
  { ad: 'İş başına kiralama', ne: 'Kısa ömürlü, görev kapsamlı izin; daha geniş izin üretemez.' },
  { ad: 'Sürekli tarama', ne: 'Yeni açık, özet değişimi, kullanım ve başarı izlenir.' },
  { ad: 'Emeklilik', ne: 'Güven geri çekilince kuyruktaki ve çalışan işlerde de kullanım durur.' },
];

export const HAVUZ_OLGULARI = [
  { metin: 'ClawHub\'daki 2.857 skill\'den 341\'i zararlıydı ve bilgi çalan yazılım kurduruyordu; yayıncı için tek koşul bir haftalık GitHub hesabıydı.', kaynak: 'A3-K20 (ClawHavoc)' },
  { metin: '31 bin skill\'in %26,1\'inde açık var; betik içerenler 2,12 kat daha riskli.', kaynak: 'A3-K17' },
  { metin: 'Snyk incelemesinde skill\'lerin %36,8\'i kusurlu; 76 doğrulanmış kötü amaçlı yük.', kaynak: 'A3-K19' },
  { metin: 'postmark-mcp 15 temiz sürümden sonra 1.0.16\'da bütün e-postaları gizlice BCC\'ledi.', kaynak: 'A3-K39' },
  { metin: 'Resmî MCP Registry önizlemede; yalnız metaveri ve ad alanı doğrular, güvenlik taraması yapmaz.', kaynak: 'A3-K35' },
  { metin: 'Skill sayısı arttıkça seçim bozuluyor: 20\'ye kadar doğruluk %90\'ın üstünde, 200 skill\'de yaklaşık %20.', kaynak: 'A3-K14, K15' },
];

export interface McpSunucu { ad: string; asamalar: AsamaId[]; kullanim: string; yetki: string; not: string; kaynak: string }
export const MCP_SUNUCULARI: McpSunucu[] = [
  { ad: 'Plane MCP Server', asamalar: ['ARS', 'PLN', 'HT', 'KAB'], kullanim: 'Ajanın Plane\'e bulgu ve soru yazması.', yetki: 'Yorum yazma; durum değiştirme yok', not: 'Durum geçişlerini yalnız orkestratör yapar (R54).', kaynak: 'Kullanıcı kataloğu' },
  { ad: 'GitHub (CLI tercih)', asamalar: ['ARS', 'HAR', 'KAP'], kullanim: 'Depo ve PR okuma.', yetki: 'Salt okuma; yazma deterministik ağ geçidinde', not: 'CLI + skill daha az token harcıyor (satıcı kıyası, ikincil kaynak). Lockdown modu yetki sınırı sayılmaz (E5).', kaynak: 'A3 · E5' },
  { ad: 'Context7', asamalar: ['ARS', 'GRN'], kullanim: 'Sürüme özgü resmî doküman.', yetki: 'Salt okuma', not: 'web-research ajanının panodaki seçimi.', kaynak: 'Kullanıcı kataloğu' },
  { ad: 'Playwright MCP', asamalar: ['QA', 'HT'], kullanim: 'Değerlendiricide görüntü alanlarında keşif.', yetki: 'Yalnız sandbox içinde', not: 'Keşif içindir; kalıcı testler kod olarak yazılır. Origin filtresi güvenlik sınırı değil (E5).', kaynak: 'Kullanıcı kataloğu · E5' },
  { ad: 'Gözlem (salt okur)', asamalar: ['HATA', 'GOZ'], kullanim: 'Log, iz ve metrik okuma.', yetki: 'Salt okuma', not: 'Teşhis ajanı için.', kaynak: 'A3' },
  { ad: 'Bilgi tabanı (salt okur)', asamalar: ['ARS', 'PLN'], kullanim: 'ADR, sözlük, yönergeler.', yetki: 'Salt okuma', not: 'Asıl bilgi docs/ altında kalır.', kaynak: 'A3' },
];

export const MCP_EKLENMEYECEK = [
  'Sürümü sabitlenmemiş npx / uvx paketleri',
  'Üçüncü taraf barındırma pazarları',
  'Referans sunucular (resmî filesystem ve git sunucularında açıklar bulundu)',
  'Genel kabuk (shell) MCP\'leri',
  'Otonom ajanda e-posta ya da mesaj gönderimi',
  'Depo dosyasıyla eklenen MCP\'ler',
];

export const MCP_KURUM_MODELI = [
  'Özel alt kayıt; sürüm, içerik ve araç tanımı özetleri sabit.',
  'Sunucular konteynerde, ağ izin listesiyle; kısa ömürlü, görev kapsamlı jeton; jeton aktarımı yok.',
  'Uzak trafik tek bir ağ geçidinden geçer; ağ geçidi de yamalanır.',
  'Oturum bileşiminde Rule of Two: güvenilmeyen içerik + özel veri + dışa yazma bir arada olmaz.',
  'Zorlama yönetilen ayarlarla: Claude Code\'da managed-mcp.json ve allowManagedMcpServersOnly.',
  'Karar kuralı: CLI\'si olan işte CLI + skill; iç sistemlerde ve çok kiracılı yetkide ağ geçidi arkasında MCP.',
];
