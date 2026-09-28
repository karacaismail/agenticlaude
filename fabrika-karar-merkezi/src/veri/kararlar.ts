import type { Karar, Olgu } from './tipler';

// Kararlar. Seçeneklerde öneri ya da hüküm yok: yalnız kaynaklı olgular ve bulgu tabanına bağlantı (kanit etiketleri).
const o = (metin: string, kaynak: string): Olgu => ({ metin, kaynak });

export const KARARLAR: Karar[] = [
  {
    id: 'tetik', baslik: 'Tetik', soru: 'Görev fabrikaya nasıl açılır?', tur: 'radyo', varsayilan: 'durum',
    kaynak: ['A2', 'E5', 'Pano A1', 'B3'], kanit: ['tetik', 'plane'],
    olgular: [
      o('Plane CE yalnız ağ ve bağlantı hatalarında yeniden dener (en fazla 5 deneme). HTTP 4xx ve 5xx yanıtı yeniden denenmez. Sınır dolunca webhook kapanır ve oluşturana e-posta gider.', 'A2 · Plane CE kaynak kodu'),
      o('Plane REST API varsayılan olarak API anahtarı başına dakikada 60 istek kabul eder.', 'A2'),
      o('CE v1.4.2 iş listesinde sunucu tarafında durum filtresi yok; "pql" ya da "filters" parametresi 400 döner.', 'A2'),
      o('Plane\'in webhook belgesi v2 olay biçimini anlatıyor; CE v1.4.2 kaynak kodu hâlâ v1 gövdesi gönderiyor.', 'A2'),
    ],
    secenekler: [
      { deger: 'durum', etiket: 'In Progress + "ajan" etiketi', ozet: 'Geliştirici işi In Progress\'e taşır; yalnız etiketli işler alınır.', olgular: [
        o('Plane\'de davranışı durum adı değil grup belirler. In Progress varsayılan olarak "started" grubundadır ve bu gruba başka özel durumlar da eklenebilir.', 'A2 · Plane state modeli'),
        o('Webhook\'ta durum değişikliğinin eski ve yeni değeri yalnız durum UUID\'sidir; data.state.group grubu verir.', 'A2'),
        o('Önceki pilotta REVIEW ve WAITING_DECISION da "started" grubundaydı.', 'E5'),
      ] },
      { deger: 'startask', etiket: '/startask yorumu', ozet: 'Geliştirici görev yorumuna /startask yazar.', olgular: [
        o('Plane CE webhook\'u iş kalemi yorumlarına (issue_comment) abone olabilir.', 'A2'),
        o('Panondaki A1 adımı: /startask; koşu kimliği plane:{issue}:{ac_version}; ikinci komut yeni koşu açmaz.', 'Pano · pipeline'),
      ] },
      { deger: 'agentready', etiket: 'Ayrı "Agent Ready" durumu', ozet: 'Fabrikaya açılan işler ayrı bir durumda bekler.', olgular: [
        o('Her gruba birden çok özel durum eklenebilir; durum UUID\'leri proje başına farklıdır.', 'A2'),
        o('Ön-ölüm öngörüsü AK-45: izlenen projelerdeki her In Progress iş sahiplenilirse insanın elle yürüttüğü iş de ajana gider.', 'B3'),
      ] },
    ],
  },
  {
    id: 'durumSahibi', baslik: 'Durum sahibi (orkestratör)', soru: 'Görevin durumunu, bütçesini ve beklemelerini kim tutar?', tur: 'radyo', varsayilan: 'temporal',
    kaynak: ['D1', 'E5', 'E6', 'Pano'], kanit: ['durum'],
    olgular: [
      o('D1: 9 iş akışı motorunda 111 hata kaydı; en sık sınıf takılı ya da zombi çalışma (25 kayıt).', 'D1'),
      o('Önceki pilotta durum iki yerde tutuldu: Kestra 15 saniyede bir yokladı, aşamaları Python factory_worker yürüttü.', 'E6'),
      o('Panolar arasında çelişki: STARK panosu durumu, bütçeyi ve devamı Temporal\'a; ajan-sağlayıcı panosu akışı ve insan onayını LangGraph\'a veriyor.', 'Pano · bulgular'),
    ],
    secenekler: [
      { deger: 'temporal', etiket: 'Temporal', kanit: ['temporal'], olgular: [
        o('Temporal Python\'da iş akışı kodundaki sıradan hata Workflow Task\'ı süresiz tekrarlatır; activity yeniden denemesi varsayılan olarak sınırsızdır.', 'E5'),
        o('Codex\'in pilotu gerçek Temporal üzerinde 9 senaryoyu geçti; model, GitHub ve dağıtım adımları fikstürdü.', 'E4'),
        o('İş akışı kodu LLM, dosya ya da ağ çağrısı yapamaz; hepsi aktiviteye gider (determinizm kuralı).', 'Pano · 23.09'),
      ] },
      { deger: 'dbos', etiket: 'DBOS', kanit: ['dbos'], olgular: [
        o('Kütüphane modeli, ayrı sunucu yok; durum kendi Postgres\'inde; PydanticAI entegrasyonu resmî.', 'Pano · karşılaştırma tablosu'),
      ] },
      { deger: 'restate', etiket: 'Restate', kanit: ['restate'], olgular: [
        o('Tek ikili sunucu; durum Restate sunucusunda; PydanticAI entegrasyonu resmî.', 'Pano · karşılaştırma tablosu'),
        o('v1.6 sonrası anlık görüntü işaretçisi V2\'ye geçer; bir kez yazıldıktan sonra eski sürüme dönüş desteklenmez.', 'Risk haritası'),
      ] },
      { deger: 'kestra', etiket: 'Kestra', kanit: ['kestra'], dikkat: 'Önceki pilotta durum iki yerde tutuldu (Kestra + Python).', olgular: [
        o('Önceki pilotta Kestra\'nın rolü: 11 LoopUntil (PT15S, P7D), 29 JDBC Query, 1 Pause, delivery akışında 0 retry.', 'E6'),
        o('Kestra\'da akış düzeyinde zaman aşımı yok; süre aşımı için MAX_DURATION tipi SLA kullanılıyor.', 'E5'),
        o('Kestra #16198 (2026-05-22, açık): MAX_DURATION + FAIL SLA\'sı bir task\'ı öldürünce worker JVM\'i çökme döngüsüne giriyor.', 'E5'),
      ] },
      { deger: 'hermesKanban', etiket: 'Hermes Kanban (tek makine)', kanit: ['hermes'], dikkat: 'Tek makine; olay geçmişinden yeniden oynatma yok.', olgular: [
        o('Görevler ~/.hermes/kanban.db (SQLite, WAL) içinde; her çalışan ayrı bir işletim sistemi süreci; profiller görevi kira ve heartbeat ile sahipleniyor.', 'Pano · Hermes'),
        o('Ardışık hata sınırı var (varsayılan 2). Görev toplamı, 120 dk aktif süre ve para tavanı yok.', 'Pano · Hermes'),
        o('Çökme sonrası görev yeniden sahiplenilir ama adım baştan başlar.', 'Pano · Hermes'),
      ] },
      { deger: 'n8n', etiket: 'n8n', kanit: ['n8n'], dikkat: 'Ekim 2024\'ten beri 24 kritik, 63 yüksek güvenlik bildirimi.', olgular: [
        o('GitHub Advisory veritabanında Ekim 2024\'ten bu yana n8n için 171 bildirim: 24 kritik, 63 yüksek. Ni8mare (CVE-2026-21858, CVSS 10) kimlik doğrulamasız dosya okuma ve komut çalıştırmaya izin verdi.', 'Risk haritası'),
        o('Kuyruk modunda bekleyen yürütme bir işçiyi meşgul eder; panodaki ifade: "Agent OS değildir".', 'Pano · katalog'),
      ] },
    ],
  },
  {
    id: 'ajan', baslik: 'Kodlama çalıştırıcısı', soru: 'RED ve GREEN adımlarını hangi ajan çalıştırıcısı yapar?', tur: 'radyo', varsayilan: 'claude',
    kaynak: ['A2', 'C1', 'C2', 'Risk haritası'],
    olgular: [
      o('C1: incelenen 32 hazır sistemin hiçbiri 12 gereksinimin hepsinde tam puan almıyor. En yüksek toplam 24 üzerinden 17 (GitLab Duo Agent Platform).', 'C1'),
      o('Bir ajan oturumu bir alt süreçtir; N eşzamanlı oturum N süreç ağacı ve N transcript dosyası demektir.', 'A2 · Agent SDK barındırma belgesi'),
    ],
    secenekler: [
      { deger: 'claude', etiket: 'Claude Code', kanit: ['claude-code'], olgular: [
        o('Başsız oturumun taban tepe belleği yaklaşık 0,5 GB; 205 MB transcript ile --resume 1,85 GB.', 'A2 · claude-code#79196'),
        o('Pro ve Max limitleri "olağan, bireysel kullanımı" varsayar; sunucu otomasyonu için API anahtarı belgelenmiş yoldur.', 'A2 · kullanım koşulları'),
      ] },
      { deger: 'codex', etiket: 'Codex CLI', kanit: ['codex-cli'], olgular: [
        o('Başsız bir host\'ta ChatGPT kimlik doğrulaması ACP zaman aşımı içinde tamamlanmıyor (2026-09-18).', 'D2 · bağlantı noktası kaydı'),
        o('OpenAI kademeleri: Tier 1 $100/ay, Tier 3 $1.000/ay, Tier 5 $200.000/ay harcama limiti.', 'C6'),
      ] },
      { deger: 'openhands', etiket: 'OpenHands', kanit: ['openhands'], dikkat: 'CVE-2026-33718 (yüksek); Haziran 2026\'da büyük mimari değişiklik.', olgular: [
        o('Haziran 2026\'da ana depo TypeScript "Agent Canvas"a dönüştü; eski Python kodu 27.07.2026\'da legacy deposuna taşındı.', 'C1 · C2'),
        o('Git diff işleyicisinde komut enjeksiyonu: CVE-2026-33718 (yüksek).', 'B1'),
        o('MIT çekirdek self-host; Enterprise kontrol düzlemi PolyForm Free Trial lisansıyla (yılda 30 gün).', 'C1'),
      ] },
      { deger: 'hermes', etiket: 'Hermes Agent', kanit: ['hermes'], olgular: [
        o('Model ağırlığı değişmez; karmaşık bir işten sonra ~/.hermes/skills altına skill dosyası yazar.', 'Pano · Hermes'),
        o('v0.12.0 Kanban ile tek makinede küçük bir ajan ekibini yönetebiliyor.', 'Pano · Hermes'),
      ] },
      { deger: 'goose', etiket: 'goose', kanit: ['goose'], olgular: [
        o('Stripe\'ın Minions ajanları Block\'un goose ajanının bir forku.', 'A1 · Stripe'),
        o('Block\'un geliştirip Agentic AI Foundation\'a devrettiği açık kaynak ajan.', 'Pano'),
      ] },
      { deger: 'openclaw', etiket: 'OpenClaw', kanit: ['openclaw'], dikkat: '8 ayda 722 güvenlik bildirimi (14 kritik).', olgular: [
        o('2026-01-31 ile 2026-09-11 arasında 722 güvenlik bildirimi: 14 kritik, 249 yüksek, 390 orta, 69 düşük; onay bağının atlatılması dahil.', 'Risk haritası · BL-02496'),
        o('CVE-2026-25253 (CVSS 8.8): Control UI, gatewayUrl parametresine doğrulamadan bağlanıp kimlik belirtecini gönderiyordu; 2026.1.29\'da düzeltildi.', 'Olay kaydı'),
        o('ClawHub\'daki 2.857 skill\'den 341\'i zararlıydı.', 'A3'),
      ] },
      { deger: 'pi', etiket: 'Pi', kanit: ['pi'], dikkat: 'Yerleşik izin sistemi ve sandbox yok; araç çağrılarını onay istemeden çalıştırır.', olgular: [
        o('Başsız çalışma için print, JSON olay akışı ve RPC (stdin/stdout JSONL) kipleri ile TypeScript SDK var. OpenClaw bu bileşenler üzerine kurulu.', 'Pi belgeleri · A. Ronacher, Ocak 2026'),
        o('MCP desteği bilinçli olarak yok; 37 resmî belgenin hiçbirinde MCP geçmiyor. Araçlar TypeScript eklentisiyle eklenir.', 'Pi belgeleri · A. Ronacher, Ocak 2026'),
        o('Haziran 2026\'da 4 CVE, en ağırı CVSS 7.3. Yeni pakette 0.78.1 ve 0.79.0 ile yamalı; eski @mariozechner paketi yamasız ve 21–27 Eylül haftasında 1.314.024 kez indirildi.', 'GitHub güvenlik bildirimleri · npm'),
        o('Otomatik kiplerde proje güveni sorulamaz: varsayılan ayarda depodaki .pi eklentileri yüklenmez, AGENTS.md ve CLAUDE.md her durumda yüklenir.', 'Pi belgeleri · security'),
        o('Mayıs 2026\'da Earendil\'e geçti. MIT lisanslı; 0.87.1 sürümünde, 10 ayda 263 sürüm yayımlandı.', 'GitHub · npm'),
      ] },
    ],
  },
  {
    id: 'qa', baslik: 'Bağımsız QA', soru: 'QA\'yı hangi çalıştırıcı yapar?', tur: 'radyo', varsayilan: 'codex',
    kaynak: ['A1', 'A3', 'Pano'], kanit: ['dogrulayici'],
    olgular: [
      o('Ajan 54 döngünün her birinde iyileşme iddia etti; %56\'sında ölçülen değişim sıfır ya da negatifti.', 'A3'),
      o('LLM hakemleri kendi model ailesini kayırıyor; sıra ve uzunluktan etkileniyor.', 'Pano · bulgular'),
      o('MAST: 7 çoklu ajan çerçevesinde 1.600\'den fazla iz; başarısızlık oranı %41 ile %86,7 arasında.', 'A1'),
    ],
    secenekler: [
      { deger: 'codex', etiket: 'Codex CLI (OpenAI)', kanit: ['codex-cli'] },
      { deger: 'claude', etiket: 'Claude Code (Anthropic)', kanit: ['claude-code'] },
      { deger: 'openhands', etiket: 'OpenHands + açık model', kanit: ['openhands'] },
      { deger: 'yok', etiket: 'QA yok', dikkat: 'Kodlayıcının beyanı dışında doğrulayıcı yok.', olgular: [
        o('METR: RE-Bench koşularının %30,4\'ünde (39/128) ödül istismarı görüldü.', 'B2'),
      ] },
    ],
  },
  {
    id: 'kararModeli', baslik: 'Tipli karar ajanları', soru: 'DoR, yönlendirici, olgunluk ve risk ön sınıfı kararlarını ne verir?', tur: 'radyo', varsayilan: 'pydantic',
    kaynak: ['Pano · Jev', 'Araç haritası'],
    olgular: [
      o('Panodaki sınıflandırıcı ajanlar: frontend-backend-router, maturity-level, A0 triyajı (12.000 görev), definition-of-ready, risk ön sınıfı.', 'Pano · Jev'),
    ],
    secenekler: [
      { deger: 'pydantic', etiket: 'PydanticAI + mevcut model', kanit: ['pydantic'], olgular: [
        o('Panoda en çok atanan kütüphane; Temporal ile resmî entegrasyon.', 'Pano'),
      ] },
      { deger: 'jev', etiket: 'Jev (TypeSafe AI)', kanit: ['jev'], dikkat: 'Doğruluk ve kalibrasyon iddiaları üreticiye ait; senin etiketlerinde ölçülmedi.', olgular: [
        o('Girdiyi en fazla 255 etiketten birine atar; 2–10 seviyeli ölçek; kalibre edilmiş olasılıkla evet/hayır döner.', 'Pano · Jev'),
        o('Üreticiye göre 70–500 ms ve LLM\'den 40–200 kat hızlı; fiyat girdi token\'ı üzerinden.', 'Pano · Jev (üretici iddiası)'),
        o('Kapalı, barındırılan servis: görev metni ve kod parçaları dışarı çıkar.', 'Pano · Jev'),
      ] },
      { deger: 'dspy', etiket: 'DSPy ile derlenmiş sınıflandırıcı', kanit: ['dspy'], olgular: [
        o('İstem yerine modül ve metrik tanımlanır; etiketli örnek ister; model değişince yeniden derleme gerekir.', 'Araç haritası'),
      ] },
    ],
  },
  {
    id: 'birlestirme', baslik: 'Birleştirme yöntemi', soru: 'Kod ana dala nasıl girer?', tur: 'radyo', varsayilan: 'ff',
    kaynak: ['A2', 'AK-42'], kanit: ['birlestirme'],
    olgular: [
      o('Merge queue kuruluşa ait public depolarda vardır; private depolarda yalnız GitHub Enterprise Cloud kuruluşlarında. Kişisel hesaba ait depolarda yoktur.', 'A2 · GitHub belgesi'),
      o('Rulesets GitHub Free\'de yalnız public depolarda çalışır; private depolarda Pro, Team ya da Enterprise Cloud gerekir.', 'A2 · GitHub belgesi'),
      o('Merge queue kullanılıyorsa zorunlu kontrolleri çalıştıran iş akışlarına "merge_group" tetikleyicisi eklenmelidir.', 'A2 · GitHub belgesi'),
    ],
    secenekler: [
      { deger: 'ff', etiket: 'Hızlı ileri (fast-forward)', olgular: [
        o('Birleştirmeyi fabrikanın kendi hızlı ileri itmesi yaparsa yazar ve committer değişmez. Ana dalda PR zorunluysa itme yapan uygulamaya atlatma izni gerekir.', 'B3 · AK-42'),
      ] },
      { deger: 'squash', etiket: 'GitHub squash', dikkat: 'Kişisel git politikandaki committer kuralıyla çakışır.', olgular: [
        o('GitHub API ile squash birleştirmede committer "GitHub" olur.', 'B3 · AK-42'),
      ] },
      { deger: 'merge', etiket: 'GitHub merge commit', dikkat: 'Committer kimliği bu çalışmada ayrıca doğrulanmadı.', olgular: [
        o('Birleştirme commit\'ini GitHub oluşturur. AK-42 committer değişimini squash için belgeliyor; merge commit için ayrıca doğrulanmadı.', 'B3 · AK-42'),
      ] },
    ],
  },
  {
    id: 'insanRolu', baslik: 'İnsanın rolü', soru: 'İnsan sistemin neresinde?', tur: 'radyo', varsayilan: 'esUretici',
    kaynak: ['C6', 'E6', 'İhtiyaç haritası C-040'], kanit: ['insan'],
    olgular: [
      o('Faros AI (10.000+ geliştirici, 1.255 ekip): tamamlanan görev +%21, birleşen PR +%98, PR inceleme süresi +%91, ortalama PR boyutu +%154, geliştirici başına hata +%9.', 'C6'),
      o('Önceki pilotta kabul adımı 18.09 16:14 UTC\'den itibaren bir insan eylemini bekledi; 7 gün sonra P7D ile KESTRA_FAILED oldu.', 'E6'),
      o('İhtiyaç haritasındaki çelişki C-040: ilk kapı panosu ve proje amacı insanı ara süreçte eş üretici olarak konumluyor; ikinci atlastaki daha yeni beyan insanı girdi ve son çıktıyla sınırlıyor.', 'İhtiyaç haritası'),
    ],
    secenekler: [
      { deger: 'esUretici', etiket: 'Eş üretici', ozet: 'İnsan girdiyi yazar, yüksek riskte planı onaylar, çıktıyı kanıtla kabul eder.', olgular: [
        o('Proje amacın (27.09): "insan yalnız onaylayan değil, eş üretici".', 'Proje amacı'),
      ] },
      { deger: 'girdiCikti', etiket: 'Yalnız girdi ve çıktı', ozet: 'İnsan görevi formla tanımlar ve son çıktıyı kontrol eder.', olgular: [
        o('İkinci atlastaki beyan: olağan ara süreç tamamen ajanlarla yürür; belirsizlik "girdi gerekli" sorusuyla insana döner.', 'İhtiyaç haritası · C-040'),
      ] },
    ],
  },
  {
    id: 'oracle', baslik: 'Kabul oracle\'ı', soru: '"Doğru" kararını ne verir?', tur: 'radyo', varsayilan: 'resmi',
    kaynak: ['A1', 'C5', 'C6', 'E5'], kanit: ['oracle'],
    olgular: [
      o('METR: 4 bakımcı 296 ajan PR\'ını inceledi. Bakımcı birleştirme oranı otomatik SWE-bench skorundan ortalama ~24 puan düşük; normalize edilince testi geçen PR\'ların kabaca yarısı birleştirilmezdi.', 'A1'),
      o('UTBoost: SWE-Bench\'te daha önce "geçti" sayılmış 345 hatalı patch bulundu.', 'E5'),
      o('C derleyicisi vakası: 16 ajan aynı hatayı bulup birbirinin düzeltmesini ezdi; çözüm GCC\'yi bilinen-doğru derleyici oracle\'ı yapmaktı.', 'C6'),
    ],
    secenekler: [
      { deger: 'uzman', etiket: 'Uzman imzalı altın veri seti', olgular: [
        o('SGK 4/a işe giriş/çıkış servisinin test ortamı var; MUHSGK, e-Bildirge, banka ve BES için yok.', 'C5'),
        o('C5 oracle sırasının 8. kademesi insan uzman: yorum gerektiren kararlar ve altın setin imzası.', 'C5'),
      ] },
      { deger: 'resmi', etiket: 'Resmî örnekler + property/metamorfik testler', olgular: [
        o('C5 oracle sırası: mevzuat metni, Resmî Gazete tebliğ örnekleri (ör. GVGT 319: 18 sayısal örnek), SGK teşvik kitapçığı, resmî parametre tabloları, resmî hesaplayıcılar, meslek örgütü, farklı yazılımla paralel koşum, insan uzman.', 'C5'),
      ] },
      { deger: 'acTest', etiket: 'Yalnız AC → test eşlemesi', dikkat: 'Test gücünü ölçen bir mekanizma yok.', olgular: [
        o('Her kabul ölçütüne en az bir test bağlanması kapsamı gösterir; testin yanlış kodu yakalayıp yakalamadığını göstermez.', 'Pano · bulgular'),
      ] },
    ],
  },
  {
    id: 'sandbox', baslik: 'Sandbox', soru: 'Ajan nerede çalışır?', tur: 'radyo', varsayilan: 'docker',
    kaynak: ['C6', 'E6', 'Risk haritası'], kanit: ['sandbox'],
    olgular: [
      o('Anthropic Agent SDK belgesi: ajan başına 1 GiB RAM, 5 GiB disk, 1 CPU "başlangıç noktası"; "taban, tavan değil".', 'C6'),
      o('Firecracker: 125 ms altında açılış, VM başına 5 MiB altında ek yük, host başına saniyede 150 microVM.', 'C6'),
    ],
    secenekler: [
      { deger: 'docker', etiket: 'Docker konteyner + çıkış vekili', kanit: ['docker'], olgular: [
        o('Çıkış vekili Colima\'da denendi: api.anthropic.com 401, npm 200 döndü; example.com ve gist.github.com 403 ile reddedildi (27.09).', 'Devir-teslim bulgusu'),
        o('Önceki pilotta tarayıcı test konteyneri 1 GiB sınırda OOM verdi; 2 GiB\'ta 3/3 geçti; ~150 testte 2 GiB de yetmedi.', 'E6'),
      ] },
      { deger: 'worktree', etiket: 'git worktree + devcontainer', olgular: [
        o('Panodaki "izole dev alanı"; iptalde konteynerin öldürülmesi gerekiyor.', 'Pano · katalog'),
      ] },
      { deger: 'e2b', etiket: 'E2B (bulut)', kanit: ['e2b'], dikkat: 'Varsayılan ağ çıkışı açık.', olgular: [
        o('allowOut verilmezse sandbox\'tan bütün dış trafiğe izin verilir.', 'Risk haritası · E2B SDK belgesi'),
        o('Pro $150/ay: en fazla 100 eşzamanlı sandbox, oturum ≤ 24 saat; Enterprise en az $3.000/ay.', 'C6'),
      ] },
      { deger: 'daytona', etiket: 'Daytona', kanit: ['daytona'], dikkat: 'Açık kaynak deposu bakımsız.', olgular: [
        o('Açık kaynak deposu: "This repository is no longer maintained." Haziran 2026\'dan beri geliştirme özel kod tabanında.', 'C6'),
      ] },
    ],
  },
  {
    id: 'calismaYeri', baslik: 'Çalışma yeri', soru: 'Fabrika nerede koşar?', tur: 'radyo', varsayilan: 'sunucu',
    kaynak: ['C6', 'KP-06', 'E6'], kanit: ['sunucu'],
    secenekler: [
      { deger: 'sunucu', etiket: 'Hetzner sunucu (Ubuntu + Docker Engine)', olgular: [
        o('Hetzner AX102: 16 çekirdek/32 iş parçacığı, 128 GB DDR5 ECC, 2×1,92 TB NVMe; aylık €257,30 + €129 kurulum.', 'C6'),
        o('144 orta ajan için tahmin: RAM ya da CPU sınırına göre 10–18 AX102.', 'C6'),
      ] },
      { deger: 'mac', etiket: 'Mac + Colima', dikkat: 'Önceki pilotta uyku kiralamaları kırdı.', olgular: [
        o('Önceki pilotta Mac uykusu gece üretimini durdurdu; uyanışta SCHEDULER_LEASE_LOST ve zombi slot görüldü.', 'KP-06'),
        o('13.09\'da 227 saniye boşta kalınca Mac uyudu; caffeinate -i -w <pid> ile önlendi.', 'E6'),
      ] },
    ],
  },
  {
    id: 'model', baslik: 'Model erişimi', soru: 'Ajanlar modele nasıl erişir?', tur: 'radyo', varsayilan: 'apiBuild',
    kaynak: ['C6', 'A2'], kanit: ['model'],
    olgular: [
      o('Önbellekten okunan girdi token\'ı ITPM limitine sayılmaz.', 'C6 · Anthropic belgesi'),
      o('Fiyatlar (2026-09, 1M token): Opus 5.5 $4 giriş / $20 çıkış; Sonnet 5 $2 / $10; Haiku 4.5 $1 / $5.', 'C6'),
    ],
    secenekler: [
      { deger: 'apiBuild', etiket: 'API anahtarı · Build/Scale kademesi', olgular: [
        o('Build: 5.000 RPM, 5.000.000 ITPM, 1.000.000 OTPM; aylık harcama tavanı $1.000. Scale: 10.000 RPM, 10M ITPM, 2M OTPM; tavan $200.000.', 'C6'),
      ] },
      { deger: 'apiStart', etiket: 'API anahtarı · Start kademesi', dikkat: 'Aylık $500 tavan; tavanda ay sonuna kadar 429.', olgular: [
        o('Start: 1.000 RPM, 2.000.000 ITPM, 400.000 OTPM; aylık harcama tavanı $500.', 'C6'),
        o('Tavana ulaşınca istekler ayın 1\'i 00:00 UTC\'ye kadar HTTP 429 döner; retry-after yok.', 'C6'),
      ] },
      { deger: 'abonelik', etiket: 'Abonelik (Pro/Max)', dikkat: 'Pro/Max limitleri olağan, bireysel kullanımı varsayar.', olgular: [
        o('"Advertised usage limits for Pro and Max plans assume ordinary, individual usage of Claude Code and the Agent SDK."', 'A2 · kullanım koşulları'),
        o('Üçüncü taraflar Free, Pro ya da Max kimlik bilgileriyle kullanıcıları adına istek yönlendiremez.', 'A2 · kullanım koşulları'),
      ] },
    ],
  },
  {
    id: 'bildirimAraci', baslik: 'Bildirim aracı', soru: 'Hatırlatma ve yükseltmeleri kim gönderir?', tur: 'radyo', varsayilan: 'orkestrator',
    kaynak: ['Pano', 'Risk haritası'], kanit: ['bildirim'],
    secenekler: [
      { deger: 'orkestrator', etiket: 'Orkestratör aktivitesi (doğrudan)' },
      { deger: 'n8n', etiket: 'n8n (yapıştırıcı)', kanit: ['n8n'], dikkat: 'Ekim 2024\'ten beri 24 kritik güvenlik bildirimi.', olgular: [
        o('GitHub Advisory veritabanında Ekim 2024\'ten bu yana n8n için 171 bildirim: 24 kritik, 63 yüksek.', 'Risk haritası'),
      ] },
      { deger: 'hermes', etiket: 'Hermes Agent (operasyon ajanı)', kanit: ['hermes'], olgular: [
        o('Panoda Hermes için anılan kullanım: backlog triyajı, günlük özet, Telegram/Slack bildirimi, zamanlanmış kontroller.', 'Pano · Hermes'),
      ] },
    ],
  },
  {
    id: 'bildirim', baslik: 'Bildirim kanalları', soru: 'İnsan nereden haber alır?', tur: 'kutu', varsayilan: ['plane', 'slack'],
    kaynak: ['KP-13', 'KP-15'], kanit: ['bildirim'],
    olgular: [o('Önceki pilotta dokuz durmanın hepsi kullanıcı "bitti mi?" diye sorunca fark edildi.', 'KP-13')],
    secenekler: [
      { deger: 'plane', etiket: 'Plane yorumu' }, { deger: 'slack', etiket: 'Slack' },
      { deger: 'telegram', etiket: 'Telegram' }, { deger: 'eposta', etiket: 'E-posta' },
    ],
  },
  {
    id: 'ortamlar', baslik: 'Yayın ortamları', soru: 'Aynı imaj hangi ortamlardan geçer?', tur: 'kutu', varsayilan: ['alpha'],
    kaynak: ['Pano', 'A0', 'Codex DP-10'], kanit: ['ortam'],
    olgular: [
      o('Pano E: alpha, beta, RC ve prod test ortamı değildir; düzeltme DEV\'de yapılır; eski yeşil sonuç yeni SHA\'ya taşınmaz.', 'Pano · pipeline'),
      o('Önceki pilottan taşınabilir parça: tek imajla alpha → beta → rc → prod terfisi.', 'A0'),
      o('Codex statik incelemesi DP-10: yavaş eski CI, yeni sürüm dağıtıldıktan sonra alpha\'yı eski commit\'e geri taşıyabiliyor.', 'Codex'),
    ],
    secenekler: [
      { deger: 'alpha', etiket: 'alpha' }, { deger: 'beta', etiket: 'beta' }, { deger: 'rc', etiket: 'RC' }, { deger: 'prod', etiket: 'prod' },
    ],
  },
  {
    id: 'gorunum', baslik: 'Diyagram görünümü', soru: 'Akış nasıl gruplansın?', tur: 'radyo', varsayilan: 'bolum',
    kaynak: [],
    secenekler: [
      { deger: 'kume', etiket: 'Teknoloji kümeleri', ozet: 'Her kümenin kendi teknolojisi; küme bitince sıradakine geçilir.' },
      { deger: 'bolum', etiket: 'Dört ana bölüm', ozet: 'Plane, agentic-rdd-development, GitHub CI/CD, alpha.' },
      { deger: 'kumesiz', etiket: 'Kümesiz (tek akış)' },
    ],
  },
];

export const kararBul = (id: string) => KARARLAR.find((k) => k.id === id)!;
export const secenekEtiket = (kararId: string, deger: string) =>
  kararBul(kararId).secenekler.find((s) => s.deger === deger)?.etiket ?? deger;
