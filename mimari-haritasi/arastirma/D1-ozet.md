# D1 — Orkestratör / durable-execution katmanında başkalarının yaşadığı hatalar

Tarih: 2026-09-27. Ham veri: `D1-orkestrator-hatalari.json` (9 motor, 100+ kayıt). Issue tarihleri açılış tarihidir. Tekil issue'lar yaygınlığı göstermez. **[K]** işareti, sınıfın kullanıcının Kestra denemesinde de görüldüğünü belirtir.

## 1. Takılı / zombi / "stale RUNNING" çalışmalar [K]
- **Kestra:** Worker düzgün kapanırken fail olan task sonsuza dek RUNNING kalıyor ([#17124](https://github.com/kestra-io/kestra/issues/17124), 2026-06, kapalı). Postgres restart'ı execution'ları takılı bırakıyor ([#8356](https://github.com/kestra-io/kestra/issues/8356), 2025-04, açık). DB bağlantısı kopunca servisler kendini yeniden başlatmıyor ([#14059](https://github.com/kestra-io/kestra/issues/14059), açık). `workerTaskRestartStrategy` ayarı uygulanmıyor ([#16970](https://github.com/kestra-io/kestra/issues/16970), açık).
- **Hatchet:** TS worker kalıcı zombiye dönüyor, bu sırada health yine HEALTHY gösteriyor ([#4824](https://github.com/hatchet-dev/hatchet/issues/4824), 2026-08, açık). RUNNING'de kalan işi iptal etmenin yolu yok ([#2573](https://github.com/hatchet-dev/hatchet/issues/2573)).
- **DBOS:** Kurtarılan workflow PENDING'de kalıp concurrency=1 kuyruğunu kilitliyor ([#805](https://github.com/dbos-inc/dbos-transact-py/issues/805)).
- **Trigger.dev:** Child run'lar bittiği halde parent hiç devam etmiyor ([#4971](https://github.com/triggerdotdev/trigger.dev/issues/4971), 2026-09, açık).
- **Conductor:** Workflow hiçbir hata vermeden takılıyor ([#436](https://github.com/conductor-oss/conductor/issues/436)). **Restate** ekibi takılı invocation'lar için bir "güvenlik ağı" üzerinde çalışıyor ([#4453](https://github.com/restatedev/restate/issues/4453)).
- Tek cümlelik ders: Motorun "RUNNING" demesi, işin gerçekten yürüdüğü anlamına gelmiyor.

## 2. Restart sonrası kaybolan görev veya olay
- **Kestra:** JDBC broadcast consumer, sıra dışı commit edilen mesajları kalıcı olarak atlıyor, bu yüzden kill ve trigger olayları kayboluyor ([#19848](https://github.com/kestra-io/kestra/issues/19848), 2026-09-27, açık). Ayrı worker kurulumunda task yeniden gönderilmiyor ([#4147](https://github.com/kestra-io/kestra/issues/4147)).
- **DBOS:** Recovery sırasında Postgres restart olursa workflow'lar sonsuza dek PENDING kalıyor ([#716](https://github.com/dbos-inc/dbos-transact-py/issues/716)).
- **Windmill:** Geçici bir DB hatasından sonra schedule kalıcı olarak duruyor ([#10168](https://github.com/windmill-labs/windmill/issues/10168)).
- **Hatchet:** Task sessizce düşüyor ve concurrency slotu sızıyor ([#4494](https://github.com/hatchet-dev/hatchet/issues/4494)).

## 3. Zaman aşımı, uzun LLM adımları ve günlerce insan beklemesi [K]
- **Kestra Pause:** Resume edildikten sonra bile timeout flow'u fail ediyor ([#9319](https://github.com/kestra-io/kestra/issues/9319)). Süre dolunca `errors` dalı çalışmıyor ([#9794](https://github.com/kestra-io/kestra/issues/9794)). Döngü içindeki Pause, parent'ı devam ettirilemeyecek şekilde durduruyor ([#19373](https://github.com/kestra-io/kestra/issues/19373), 2026-09, açık).
- **Inngest:** Bir adım en fazla 2 saat sürebiliyor. Free planda sleep en fazla 7 gün ([limitler](https://www.inngest.com/docs/usage-limits/inngest)).
- **Temporal:** Heartbeat timeout'a düşen uzun activity baştan başlıyor ve önceden işlenmiş kayıtlar için ikinci kez child workflow açılıyor ([forum, 2023-05](https://community.temporal.io/t/activity-restarts-from-beginning-of-the-processs-on-heartbeattimeout-and-on-acitivitynotexistsexcpetion/8225)). Heartbeat atan activity'lerde kalıcı worker deadlock ([#1642](https://github.com/temporalio/sdk-python/issues/1642)).
- **Windmill AI Sessions:** Uzun konuşmalarda yanıt kesiliyor, 504'te retry döngüsüne giriyor ([#10559](https://github.com/windmill-labs/windmill/issues/10559)).

## 4. Retry kaynaklı çift yan etki / idempotency
- **Kestra:** 2+ executor replikasıyla çift execution oluşuyor ([#14196](https://github.com/kestra-io/kestra/issues/14196)). Kill edilen task tekrar gönderiliyor ([#19722](https://github.com/kestra-io/kestra/issues/19722), 2026-09, açık).
- **Conductor:** HTTP task, COMPLETED olduktan sonra ikinci kez çalışıyor ([#630](https://github.com/conductor-oss/conductor/issues/630), açık).
- **Hatchet:** Atomik olmayan tetikleyici ve duvar saatine bağlı idempotency TTL yüzünden iş ya kayboluyor ya da iki kez çalışıyor ([#4129](https://github.com/hatchet-dev/hatchet/issues/4129)).
- **Inngest:** Race-mode'daki paralel adımlar iki kez çalışıyor ([#4897](https://github.com/inngest/inngest/issues/4897)).
- **Trigger.dev:** Gece yapılan restart sonrası task'lar sonsuz kez çoğalıyor ([#1566](https://github.com/triggerdotdev/trigger.dev/issues/1566)).
- **DBOS:** Her recovery turunda bir "ghost-fork" çift çalışma üretiyor ([#759](https://github.com/dbos-inc/dbos-transact-py/issues/759)).

## 5. Determinizm ve sürümleme (çalışma sürerken kodun değişmesi)
- **Temporal Python SDK:** `asyncio.gather` + local activity ile nondeterminism ([#1578](https://github.com/temporalio/sdk-python/issues/1578), açık). Replay'i bozan random/uuid sırası ([#1109](https://github.com/temporalio/sdk-python/issues/1109)). HN'de bir kullanıcı sürümlemeyi Temporal/Cadence'in "hardest problem"i olarak nitelendiriyor ([2023-10-25](https://news.ycombinator.com/item?id=38011850)).
- **Restate TS:** Paralel `ctx.run` crash-loop'a sokuyor ([#743](https://github.com/restatedev/sdk-typescript/issues/743)). **DBOS:** Aynı `__qualname__` taşıyan iki fonksiyonda recovery yanlış fonksiyonu çalıştırıyor ([#837](https://github.com/dbos-inc/dbos-transact-py/issues/837)).

## 6. History / payload boyutu (LLM transkriptleri)
- **Reliant** (AI sohbet ürünü): Temporal, sohbet workflow'unu 52,4 MB'ta "history size exceeds limit" hatasıyla öldürdü. Recovery aynı şişik history'ye döndüğü için workflow 2,5 dakika sonra tekrar öldü ([PR #292](https://github.com/reliant-labs/reliant/pull/292), 2026-09-24). Resmi sınırlar 51.200 olay / 50 MB ([doküman](https://docs.temporal.io/workflow-execution/limits)).
- LangGraph ajanını Temporal'a taşıyan bir ekip "Input exceeds size limit" hatası aldı ([#1894](https://github.com/temporalio/sdk-python/issues/1894), 2026-09-22, açık).
- **Inngest:** Adım çıktısı en fazla 4 MiB, run state en fazla 32 MB, en fazla 1000 adım ([limitler](https://www.inngest.com/docs/usage-limits/inngest)). Mastra ajanında bu limit aşılınca asıl neden kayboluyor ve kullanıcı yalnızca "[object Object]" görüyor ([#25161](https://github.com/mastra-ai/mastra/issues/25161)).
- **Windmill:** Sonuçlardaki büyük base64 veriler Postgres TOAST'ı şişirip diski dolduruyor ([#6855](https://github.com/windmill-labs/windmill/issues/6855)). **Conductor:** Postgres tsvector limiti workflow'ları fail ediyor ([#604](https://github.com/conductor-oss/conductor/issues/604)).

## 7. LLM rate-limit, concurrency ve backlog
- **Hatchet:** Rate-limit kuyrukları refill ya da restart sonrasında duruyor ([#4746](https://github.com/hatchet-dev/hatchet/issues/4746)). Refill koşulu ters yazılmış ([#4346](https://github.com/hatchet-dev/hatchet/issues/4346)). Bir kullanıcı, upstream cooldown (429) süresince anahtarı duraklatma özelliği istiyor ([#4880](https://github.com/hatchet-dev/hatchet/issues/4880)).
- **Temporal:** Kısa bir `Unavailable` kesintisi sürekli bir retry fırtınası başlatıyor ([#11547](https://github.com/temporalio/temporal/issues/11547)). Monk, Inngest'ten Temporal'a geçerken tenant başına concurrency'yi elle kurmak zorunda kaldı ([blog, 2026-06-16](https://temporal.io/blog/how-monk-migrated-100-workflows-inngest-to-temporal)).

## 8. Worker OOM / kaynak
Kestra'da OOM'a giren task zombi RUNNING'de kalıyor ([#2653](https://github.com/kestra-io/kestra/issues/2653)), büyük metin değişkeninden sonra CPU %200'de kalıyor ([#18310](https://github.com/kestra-io/kestra/issues/18310)). Restate'te failover sırasında bellek şişiyor ([#4311](https://github.com/restatedev/restate/issues/4311)). Trigger.dev'de log tamponlama bellek sızdırıyor ([#2894](https://github.com/triggerdotdev/trigger.dev/issues/2894)). Windmill'de Playwright zombi süreç bırakıyor ([#6048](https://github.com/windmill-labs/windmill/issues/6048)).

## 9. Self-host operasyonu ve DB yükü
- **Kestra:** KILLING'de takılan tek bir execution, 6 günde Postgres'e 250 GB log yazdı ([#15829](https://github.com/kestra-io/kestra/issues/15829)). Kuyruk tüketicisi ölünce `queues` tablosu sınırsız büyüyor ([#16794](https://github.com/kestra-io/kestra/issues/16794)). Geçici bir deadlock executor'u kapatıyor ([#17574](https://github.com/kestra-io/kestra/issues/17574)).
- **Hatchet:** Self-host engine yaklaşık bir hafta sonra kendi DB'sini bozuyor ([#3823](https://github.com/hatchet-dev/hatchet/issues/3823)). Hatchet yazarlarına göre v0'da büyük backlog ve long-polling CPU spike'larına, UUID PK'ler de index bloat'a yol açtı ([HN, 2025-04](https://news.ycombinator.com/item?id=43572733)).
- **Temporal:** Daylight, Temporal Cloud'dan self-host'a geçtikten haftalar sonra bağlantı havuzu açlığı yaşadı: "Slow gRPC call" uyarıları ve workflow asılmaları ([blog, 2026-09-01](https://daylight.ai/blog/how-we-migrated-off-temporal-cloud-without-downtime)).

## 10. Yükseltme ve kırıcı değişiklikler
Kestra 17.5→17.8 yükseltmesi tetiklenen flow'ları bozdu ([#4195](https://github.com/kestra-io/kestra/issues/4195)). Kestra'da eski execution'lar executor'u NPE ile durduruyor ([#16784](https://github.com/kestra-io/kestra/issues/16784)). Temporal'da sürüm atlanamıyor, yalnızca sıradaki minor'a geçilebiliyor ([doküman](https://docs.temporal.io/self-hosted-guide/upgrade-server)). Hatchet v1 motoru tamamen yeniden yazıldı ve v0 API'leri çalışmıyor ([rehber](https://docs.hatchet.run/v1/migrating/migration-guide-engine)). Trigger.dev v2'nin ömrü 2025-01-31'de bitti ([duyuru](https://trigger.dev/blog/v2-end-of-life-announcement)). Conductor'da yükseltme sonrası task'lar SCHEDULED'da kalıyor ([#656](https://github.com/conductor-oss/conductor/issues/656)).

## 11. Gözlemlenebilirlik boşlukları
Hatchet'te `/health` UNHEALTHY iken bile 200 dönüyor ([#4823](https://github.com/hatchet-dev/hatchet/issues/4823)). Temporal, ResourceExhausted hatasını Unavailable olarak gösteriyor ([#11571](https://github.com/temporalio/temporal/issues/11571)). Trigger.dev self-host'ta OTel span'ları görünmüyor ([#2821](https://github.com/triggerdotdev/trigger.dev/issues/2821)). Kestra dashboard'u DB'yi kilitliyor ([#13086](https://github.com/kestra-io/kestra/issues/13086)).

## 12. Lisans, fiyat ve sahiplik
Netflix, 2023-12-13'te Conductor'ı arşivledi ve projeyi Orkes fork'u devraldı ([TechCrunch](https://techcrunch.com/2023/12/13/orkes-forks-conductor-as-netflix-abandons-the-open-source-project/)). Kestra'da HA, Worker Groups, RBAC, SSO ve güvenli yükseltme için Maintenance Mode yalnızca EE'de ([doküman](https://kestra.io/docs/oss-vs-paid)). Restate BUSL 1.1 ile lisanslı ([LICENSE](https://github.com/restatedev/restate/blob/main/LICENSE)). Inngest self-host tek süreç olarak çalışıyor, lisansı SSPL'den 3 yıl sonra Apache'ye dönen bir modele geçti ([2024-09-23](https://www.inngest.com/blog/inngest-1-0-announcing-self-hosting-support)). Windmill'in AGPL/çift lisans yapısı bir kullanıcı tarafından geç fark edildi ([#4514](https://github.com/windmill-labs/windmill/issues/4514)). Daylight'ın Temporal Cloud faturası her yeni tenant ile arttı ([blog](https://daylight.ai/blog/how-we-migrated-off-temporal-cloud-without-downtime)).

## 13. "İki beyin" / bölünmüş durum [K]
- LangGraph'in kendi Postgres checkpointer'ı Temporal'a geçişte devre dışı kaldı. Ekip kalıcılığı elle eklemek zorunda kaldı ve ardından boyut limitine takıldı ([#1894](https://github.com/temporalio/sdk-python/issues/1894)).
- Reliant, toplu veriyi Temporal history'sinin dışına taşıdı ([PR #292](https://github.com/reliant-labs/reliant/pull/292)). Ably de transkriptin workflow dışında tutulmasını öneriyor ([yazı](https://ably.com/temporal/managing-conversation-history-in-a-temporal-ai-agent-chat), tarih doğrulanamadı).
- DBOS'a göre (satıcı argümanı) ayrı bir motorla çalışırken "checkpoint'siz başarılı DB yazısı" penceresi oluşuyor ([blog](https://www.dbos.dev/blog/co-locating-workflow-state-with-your-data), tarih doğrulanamadı).

## Kullanıcının Kestra denemesiyle eşleşme
- **15 sn DB polling + asıl işi yapan Python ("iki beyin")** → Sınıf 13. Kamuya açık en yakın örnekler Temporal + LangGraph vakaları (#1894, Reliant).
- **7 günlük timeout'un bekleyen task'ı öldürmesi** → Sınıf 3. Kestra'da Pause/timeout kenar hataları var (#9319, #9794, #19373). Inngest free planda da 7 günlük sleep sınırı bulunuyor. Kullanıcının karşılaştığı 7 günlük değerin kaynağı bu araştırmada doğrulanamadı.
- **Takılı/stale RUNNING** → Sınıf 1 ve 9. Kestra'da aynı sınıfta 2026'da hâlâ açık birden çok issue var (#8356, #14059, #16970, #19734).

Kapsam notu: Airflow, Prefect ve Argo'yu doğrudan karşılaştıran bir kaynak bulunamadı. Atlan'ın Argo→Temporal yazısı okunmadı.
