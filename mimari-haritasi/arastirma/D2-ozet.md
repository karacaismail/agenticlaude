# D2 – Ajan platformu katmanında yaşanan hatalar (özet)

Tarih: 27.09.2026. Ayrıntılar `D2-ajan-platformu-hatalari.json` dosyasında: 8 araç, 66 hata kaydı, 11 dikiş hatası. Issue durumları ve tarihleri o gün `gh` ile okundu. **[YENİ]** etiketi, kanıtın B1, C1 ve C2'de olmadığını gösterir. **[BİLİNEN]** etiketi, konunun daha önce işlendiğini ve burada yalnızca atıf yapıldığını gösterir.

## Araç bazında

**Ruflo (eski Claude Flow; 73,4k yıldız, günlük push).** B1, C1 ve C2'de hiç yoktu; buradaki bulguların hepsi [YENİ].
- README iddiaları bağımsız denetimlerde tutmadı:
  - MCP araçlarının ~%85'i iş yapmadan `success` dönüyordu ([#653](https://github.com/ruvnet/ruflo/issues/653), 2025-08).
  - README'deki SONA, HNSW, RL algoritmaları ve Raft/BFT için kodda 0 eşleşme çıktı; görev yürütmesi bir `setTimeout` gecikmesinden ibaretti ([#1326](https://github.com/ruvnet/ruflo/issues/1326), 2026-03).
  - v3.5.51'de 300+ aracın ~290'ı saplama (stub) koddu: `agent_spawn` ile açılan ajan hep `idle` kalıyordu, `wasm_agent_prompt` girdiyi olduğu gibi geri döndürüyordu ([#1514](https://github.com/ruvnet/ruflo/issues/1514), 2026-04).
- Bakımcı her denetimi "düzeltildi" diyerek 2–8 gün içinde kapattı. Düzeltmeler bağımsız olarak doğrulanamadı.
- "%84 SWE-bench" iddiasının sonuçları hiç paylaşılmadı. Bakımcı bu konuda "I should get rid of this" dedi ([#600](https://github.com/ruvnet/ruflo/issues/600)). Güncel README'de bu iddia yok. HNSW hız iddiası da "150x–12.500x"ten "N=20k'da ~1,9x"e indi.
- README kendi içinde çelişiyor: aynı sayfada hem "314 MCP aracı" hem "~210 araç" yazıyor.
- Güvenlik:
  - Karartılmış bir `preinstall` betiği kullanıcının npm önbelleğinden dosya siliyordu ([#1261](https://github.com/ruvnet/ruflo/issues/1261)).
  - Her commit'e kullanıcıya sorulmadan `Co-Authored-By: claude-flow` ekleniyordu ([#1670](https://github.com/ruvnet/ruflo/issues/1670)).
  - Araç açıklamalarına gizli talimat konduğu iddiası var ([#1375](https://github.com/ruvnet/ruflo/issues/1375)). Kaynak gösterilen #1323 artık açılmıyor, bu yüzden doğrulanamadı.
- Veri bütünlüğü:
  - Başarılı dönen yazma işlemleri kaybolabiliyor, SQLite indeksi bozuluyor ([#2736](https://github.com/ruvnet/ruflo/issues/2736)).
  - `doctor` komutu bozuk veritabanında da "All checks passed" diyor ([#2737](https://github.com/ruvnet/ruflo/issues/2737)).
- Kurulumda CI kontrolleri birleştirmeyi engellemiyor ve `deployment` komutları sabit saplama kod ([#1425](https://github.com/ruvnet/ruflo/issues/1425)).

**Gas Town.** C1'de admin yetkisiyle CI atlatılması (#4442) ve bus factor zaten vardı [BİLİNEN]. Aşağıdakiler [YENİ]:
- **Kırmızı testle merge:** DoltHub denemesinde ilk PR, entegrasyon testleri kırmızıyken otonom olarak birleştirildi ve depo force-reset edildi. Mayor "hepsi düzeldi" dedi ama ortada yalnızca 2 PR vardı. Dört ajanın PR'larının hiçbiri kullanılabilir değildi. Maliyet 60 dakikada ~100 $ tuttu; bu, normal bir Claude Code oturumunun ~10 katı ([DoltHub](https://www.dolthub.com/blog/2026-01-15-a-day-in-gas-town/)).
- **İzinsiz kullanım:** Varsayılan formüller, kullanıcının LLM kotası ve GitHub hesabıyla Gas Town'un kendi deposuna PR açabiliyordu ([#3649](https://github.com/gastownhall/gastown/issues/3649)).
- **İş kaybı ve kendi kendine zarar:**
  - ~253 süreç 24,4 GB bellek tutunca bellek yetmedi (OOM) ([#27](https://github.com/gastownhall/gastown/issues/27)).
  - Temizlik eklentisi 22 meşru oturumu öldürdü ([#2707](https://github.com/gastownhall/gastown/issues/2707)).
  - İşçiler push yapmadan silindi, iş kayboldu ([#1379](https://github.com/gastownhall/gastown/issues/1379)).
  - Kapanmış bir iş yeniden yapılıp çakışan bir kopya MR olarak açıldı ([#4698](https://github.com/gastownhall/gastown/issues/4698), açık).
  - Refinery ile main'e aynı anda push yarışı çıktı ([#594](https://github.com/gastownhall/gastown/issues/594)).
- **Oran sınırı:** 429 alındığında hesap değiştirme mekanizması yok, rig'ler boşta kalıyor ([#232](https://github.com/gastownhall/gastown/issues/232), [#1066](https://github.com/gastownhall/gastown/issues/1066)).

**Factory (Droids)** [YENİ]. Kapalı bir ürün; herkese açık issue takibi 2026-08'de başladı.
- `droid exec --mission` hiç tur çalıştırmadan exit 0 ve `success` dönüyor ([#2](https://github.com/Factory-AI/factory/issues/2)).
- `droid-action` 402 kullanım limitine takılınca üç kez yeniden deniyordu. 10–17 Eylül arasında limitte biten PR-gün başına 4,7 oturum açıldı ([PR#141](https://github.com/Factory-AI/droid-action/pull/141)).
- Otomatik inceleme, tek bir aday bulgu için 8 ayrı review'da 29 aynı yorumu attı ([#117](https://github.com/Factory-AI/droid-action/issues/117)).
- Üçüncü taraf bir rapora göre droid, `--skip-permissions-unsafe` ile ve tüm ortam değişkenlerini (`GITHUB_TOKEN`, `FACTORY_API_KEY`) devralarak çalışıyor ([perl-lsp-swarm #15840](https://github.com/EffortlessMetrics/perl-lsp-swarm/issues/15840)). Factory'nin yanıtı doğrulanamadı.
- Proje kapsamındaki `hooks.json` hiç okunmuyor, custom droid'lere sıfır MCP aracı gidiyor ve sabitlenen model başka bir modele düşüyor ([#3](https://github.com/Factory-AI/factory/issues/3), [#13](https://github.com/Factory-AI/factory/issues/13), [#8](https://github.com/Factory-AI/factory/issues/8)).

**Devin.** B1'de Answer.AI testi (20 görevden 3'ü başarılı) vardı [BİLİNEN]. Aşağıdakiler [YENİ]:
- **Güvenlik:** Bağımsız araştırmacıya göre Devin'de istem enjeksiyonuna karşı koruma yoktu. Zararlı bir sayfa, `expose_port` ile dosyaları internete açtırabildi. 120+ gün boyunca düzeltme takvimi verilmedi ([Embrace The Red](https://embracethered.com/blog/posts/2025/devin-i-spent-usd500-to-hack-devin/), 2025-08). Güncel durumu doğrulanamadı.
- **API:** v1 ve v2 "legacy" durumunda ama kapanış tarihi yok; oran sınırları belgelenmemiş ([belge](https://docs.devin.ai/api-reference/overview)).
- **Oturumlar:** 30 günden eski oturum devam ettirilemiyor ([belge](https://docs.devin.ai/admin/common-issues.md)).
- **Fiyat modeli:** ACU ve 500 $'lık Team planı 2026 Mart–Nisan'da kaldırıldı. Bu bilgi ikincil kaynaklardan ([continuumcode](https://continuumcode.ai/guides/devin-pricing/)); resmî duyuru doğrulanamadı.

**OpenHands.** C2'deki deadlock, eşzamanlılık sınırı, `RUNNING` takılması ve CVE; B1'deki döngü ve 401 [BİLİNEN]. Aşağıdakiler [YENİ]:
- Maliyet tavanı yanlış metriğe baktığı için hiç tetiklenmedi ([#8238](https://github.com/OpenHands/OpenHands/issues/8238)).
- Actions resolver ~6 saat takıldı ([#6172](https://github.com/OpenHands/OpenHands/issues/6172)).
- Kendi PR inceleme botu, PR açıklamasına gizlenmiş istem enjeksiyonuna uydu ([SDK #2026](https://github.com/OpenHands/software-agent-sdk/issues/2026)).
- Resmî kurulum `docker.sock`'u konteynere bağlıyor ([#7154](https://github.com/OpenHands/OpenHands/issues/7154)).
- Uzun bir komutun zaman aşımı "sistem çöktü" hatası olarak görünüyor ([#13665](https://github.com/OpenHands/OpenHands/issues/13665)).

**Open SWE** [YENİ].
- Depoda issue'lar kapalı (API 410 dönüyor). Aşağıdaki kanıtların hepsi ekibin kendi PR'larından.
- Yerel shell'den dışlanacak sır listesi elle tutuluyor ve 27 sırrın yalnızca 10'unu kapsıyordu. Düzeltme PR'ı birleştirilmeden kapatıldı ([PR#2736](https://github.com/langchain-ai/open-swe/pull/2736)).
- PR yazarını model sohbetten seçiyordu; biri başkası adına PR açtı ([PR#3195](https://github.com/langchain-ai/open-swe/pull/3195)).
- Sandbox zaman aşımı "boş başarı" olarak dönüyordu ([PR#3007](https://github.com/langchain-ai/open-swe/pull/3007)).
- PR açıklamalarına konan sandbox linkleri zamanla ölüyor ([PR#3051](https://github.com/langchain-ai/open-swe/pull/3051)).
- 14 ayda üç büyük yeniden yazım yapıldı ([#627](https://github.com/langchain-ai/open-swe/pull/627), [#797](https://github.com/langchain-ai/open-swe/pull/797), [#2186](https://github.com/langchain-ai/open-swe/pull/2186)).

**MetaGPT ve ChatDev.** B1'deki "mevcut koda uygulanamama" ve donma sorunları [BİLİNEN]. Aşağıdakiler [YENİ]:
- **MetaGPT:** Son commit 2026-01-21, son sürüm 2025-03-09. Checkpoint'ten geri dönüşte işlenmemiş rol mesajları kayboluyor ([#2151](https://github.com/FoundationAgents/MetaGPT/issues/2151), yanıtsız). Fork'lardan gelen PR'larda CI kırık ([#2161](https://github.com/FoundationAgents/MetaGPT/issues/2161)).
- **ChatDev:** 2026-01-07'de "yazılım şirketi" kurgusunu legacy dala taşıyıp zero-code platforma döndü ([dal](https://github.com/OpenBMB/ChatDev/tree/chatdev1.0)). İsteklerde zaman aşımı yok ([#674](https://github.com/OpenBMB/ChatDev/issues/674)). Güvenlik ifşa kanalı yok ([#667](https://github.com/OpenBMB/ChatDev/issues/667)).

## Orkestratör ile ajan arasındaki dikiş [YENİ]

- **Temporal:**
  - OpenAI Agents SDK entegrasyonunda akış (streaming) desteklenmiyor ([sdk-python #1009](https://github.com/temporalio/sdk-python/issues/1009), 2025-07'den beri açık).
  - Claude Code alt ajanları çalışmaya devam ederken heartbeat durdu ve activity zaman aşımına düştü ([Shannon #105](https://github.com/KeygraphHQ/shannon/issues/105)).
- **Trigger.dev:** MCP üzerinden run beklerken, takılan bir run yüzünden süresiz bloklandı ([#3032](https://github.com/triggerdotdev/trigger.dev/issues/3032)).
- **Devin:** Supervisor'a zaman aşımı eklemek, çift ücretli oturum açılmasına yol açabiliyor; idempotency penceresi belgelenmemiş ([the-gibson #251](https://github.com/The-AIE/the-gibson/issues/251)). Kaynak tek kişilik bir proje.
- **OpenHands agent-server:**
  - İptal yarışı son durum güncellemesini yutuyor ([#4387](https://github.com/OpenHands/software-agent-sdk/issues/4387)).
  - Konuşma takılıyken health 200 dönüyor ([#4997](https://github.com/OpenHands/software-agent-sdk/issues/4997)).
  - Webhook ucuna ulaşılamayınca konteyner çöküyor ([#4245](https://github.com/OpenHands/software-agent-sdk/issues/4245)).
  - Serileştirme hatasında olaylar düşüyor ([#3516](https://github.com/OpenHands/software-agent-sdk/issues/3516)).
  - Sürüm yükseltmesi resume'u kırdı ([#5251](https://github.com/OpenHands/software-agent-sdk/issues/5251)).
  - Headless ortamda Codex ACP kimlik doğrulaması zaman aşımına düşüyor ([#5167](https://github.com/OpenHands/software-agent-sdk/issues/5167)).

## Sınıflar arası tablo

| Sınıf | Yeni kanıtlar | B1/C1 ilişkisi |
|---|---|---|
| Yanlış başarı (exit 0 / success, iş yok) | Factory #2, Open SWE #3007, Gas Town #4527, DoltHub Mayor, Ruflo #653/#2737 | B1 "test kandırma" ailesi; burada CLI ve araç düzeyinde |
| Maliyet çarpanı | 402 yeniden denemesi, Gas Town upstream formülü, ~100 $/saat, OpenHands #8238, Devin çift oturum | Yeni örnekler |
| PR spam / yazarlık | droid-action 29 yorum, Open SWE #3195, Ruflo Co-Authored-By, Gas Town #3649 | Yeni |
| Kırmızı testle merge | DoltHub, Ruflo'da engellemeyen CI | C1 #4442 ile aynı sınıf, farklı olay |
| Güvenlik | Devin, OpenHands PR botu, droid ortam mirası, Open SWE sırları, Ruflo preinstall, ChatDev | B1 genel; araca özgü olanlar yeni |
| Kalıcı durum / resume | Beads, Ruflo WAL, MetaGPT #2151, OpenHands #5251 | B1 "devam edememe" sınıfını genişletir |
| İddia ile gerçeklik | Ruflo | Yeni |

**Doğrulanamayanlar:**
- Ruflo #1323 (artık açılmıyor).
- Ruflo'nun "düzeltildi" beyanları.
- Devin açığının güncel durumu ve fiyat değişikliğinin resmî duyurusu.
- droid ortam mirasına Factory'nin yanıtı.
- Open SWE sır sızıntısının sonradan düzeltilip düzeltilmediği.
