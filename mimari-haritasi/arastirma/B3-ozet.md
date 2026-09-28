# B3 — Ön-ölüm (pre-mortem): "agentic-fabrika 6 ay sonra başarısız olduysa, neden?"

İnceleme tarihi: 27 Eylül 2026. Kod: `/Users/w6x/Documents/otomasyon coding/agentic-fabrika`. Yöntem: salt okuma. İstenen bütün dosyalar satır satır okundu. İddialar `grep` ile doğrulandı. Kod değiştirilmedi.

Ayrıntılı kayıt `B3-on-olum.json` dosyasında: **62 arıza kipi**. Her birinde senaryo, olasılık ve etki (1–5), tespit sinyali, mevcut durum, `dosya:satır` kanıtı, düzeltme ve öncelik var. Bütün kanıt satırlarının dosya sınırları içinde olduğu betikle denetlendi.

| Öncelik | Adet |
|---|---:|
| MVP öncesi şart | 30 |
| S1 | 30 |
| S2 | 2 |

Sınıflara göre dağılım:
- takılma 11
- oracle 8
- durum 7
- paralellik 7
- güvenlik 7
- kaynak 6
- insan 5
- operasyon 5
- maliyet 3
- ölçek 3

## Tek paragrafta teşhis

Yeni sistem, pilotun ana hatasını düzeltiyor: dayanıklılık Temporal'da, çekirdek küçük, döngü ve bütçe sınırları deterministik. Altı ay sonraki başarısızlık tek bir büyük hatadan değil, beş kümeden gelir:

1. **Sessiz takılma geri döner.** Bunun üç nedeni var:
   - iş akışı sürümlemesi yok;
   - ajan çıktısı şema doğrulaması olmadan iş akışı koduna giriyor;
   - metrik ve uyarı kapalı.

   Sonuçta Plane'de "In Progress/Human Test" görünüp ilerlemeyen işler, pilottaki "9 gündür bayat RUNNING" durumunun yeni biçimi olur.
2. **Oracle hâlâ delikli.**
   - RED kanıtı her sıfır dışı çıkışı kabul ediyor.
   - Test yapılandırması korunmuyor.
   - İnsan onayı kanıtsız.
   - Kod insan testinden **önce** main'e birleşiyor; reddedilen kod main'de kalıyor.
3. **Paralellik tek main ve tek alpha'da tıkanır.**
   - Birleştirme kuyruğu yok.
   - Alpha dağıtımı ara SHA'ları atlıyor ve yanlış eskalasyon üretiyor.
   - main CI'ı iptal ediliyor.
   - Kırık main alpha'ya çıkıyor.
4. **Güvenlik sınırı belgelendiği kadar sıkı değil.**
   - GitHub jetonu çalışma alanının git yapılandırmasına yazılıyor ve sandbox'tan okunabiliyor.
   - Model anahtarı, çıkışı serbest bir ağda.
5. **Dış sınırlar.**
   - Plane'in dakikada 60 isteklik kotası uzlaştırıcıyla paylaşılıyor. 429 geldiğinde insan bildirimleri sessizce kayboluyor.
   - Bazı bütçe ve WIP tavanları hiç uygulanmıyor.
   - İş akışı yeniden başlayınca bütçe sıfırlanıyor.

## En kritik 10

| # | Kimlik | Başlık | O×E | Kanıt |
|---|---|---|---|---|
| 1 | AK-35 | GitHub jetonu çalışma alanının git yapılandırmasında; sandbox ve kapılar okuyabiliyor | 4×5 | `faaliyetler/depo.py:40-43,62`, `faaliyetler/sandbox.py:103,109-111` |
| 2 | AK-19 | Workflow versioning/patching yok. Kod değişince 14–30 gün bekleyen iş akışları determinizm hatasıyla sonsuz yeniden denemeye girer | 5×5 | `isci.py:38`; `patched` kodda hiç yok |
| 3 | AK-20 | LLM çıktısı şemasız iş akışına giriyor. `AttributeError` workflow task'ı sonsuz tekrara sokar | 4×4 | `akis/gorev_akisi.py:339-349,446-447,463-468` |
| 4 | AK-10 | Birleştirme insan testinden önce. Rejected veya zaman aşımına düşen işin kodu main'de kalır, geri alınmaz | 5×5 | `akis/gorev_akisi.py:485-487,510-512,521` |
| 5 | AK-44 | Aynı iş için yeni koşu sıfır bütçe ve sayaçla başlar (`ALLOW_DUPLICATE`). Operatör kaçak işi Temporal'dan durduramaz | 4×4 | `giris/app.py:50-55`, `akis/gorev_akisi.py:104-117` |
| 6 | AK-24 | Plane'in 60/dk kotası paylaşılıyor. 429'da yorum, atama ve etiket yutuluyor; `Retry-After` yok sayılıyor | 5×4 | `giris/app.py:73-90`, `akis/gorev_akisi.py:36-37,194-220` |
| 7 | AK-28 | Tek main'e 12 ekip: O(n²) CI ya da birlikte kırılan main. Merge queue yok | 5×4 | `akis/gorev_akisi.py:609-650`, `ci.yml:4-9` |
| 8 | AK-03 | Uygulayıcı test yapılandırmasını (`package.json` scripts, jest/vitest config) değiştirerek korunan testleri etkisizleştirebilir | 3×5 | `config/projeler.yaml:28-35`, `faaliyetler/sandbox.py:224-226` |
| 9 | AK-01 | RED kanıtı: import hatası ya da altyapı hatası da "başarısız test" sayılıyor | 4×4 | `faaliyetler/sandbox.py:248-249` |
| 10 | AK-36 | Model API anahtarı sandbox ortam değişkeninde ve ağ çıkışı serbest. Bağımlılık veya istem enjeksiyonuyla sızabilir | 3×5 | `faaliyetler/sandbox.py:157`, `compose.yaml:96-99` |

## MVP öncesi şart olanlar (30)

**Güvenlik**
- **AK-35:** Jetonu URL'ye ve diske yazma. `GIT_ASKPASS` ya da `http.extraHeader` kullan. GitHub App'in kısa ömürlü jetonuna geç. Mevcut jetonu döndür.
- **AK-36:** Çıkış vekili kur; yalnız model API'si ve yerel paket vekili izinli olsun. Anahtar vekilde dursun, sandbox'ta değil. Harcama sınırlı ayrı çalışma alanı aç.
- **AK-37:** `fabrika-sandbox` ağı hiçbir servise bağlı değil; işçi açılırken varlığını doğrula ya da oluştur. e2e'yi üretim ağ ayarıyla da koştur.
- **AK-38:** Çıktı dizinini depo dışında tut. Ajanın yazdığı hiçbir yolu izleme (`lstat` ya da `O_NOFOLLOW` ile denetle). İşçiyi root olmayan kullanıcıyla çalıştır. Docker erişimini dar bir yürütücüye indir.

**Sessiz takılma**
- **AK-19:** `workflow.patched` ya da Worker Versioning kullan. CI'da Replayer testi çalıştır.
- **AK-20:** Rol başına pydantic çıktı şeması tanımla. Beklenmeyen istisna eskalasyona dönsün.
- **AK-21:** Sağlayıcı hatasını yalnız CLI'nin yapılandırılmış hata alanından sınıflandır. Örnek: faturalama modülü olan bir projede "billing" kelimesi harcama tavanı sanılıyor.
- **AK-57:** Prometheus ve Alertmanager kur. Ölçülecekler:
  - `workflow_task_execution_failed`;
  - schedule-to-start gecikmesi;
  - disk;
  - Plane 429 sayısı;
  - harcama.

  Olay süresini gerçekten yaz; `sure_sn` şu an hep 0.
- **AK-18:** Konteynerlere etiket koy. İşçi açılışında sahipsiz sandbox'ları temizle. Çalışma alanına kilit koy.

**Oracle**
- **AK-01 ve AK-02:** RED kapısında JUnit/TAP raporu kullan. KT kimlikli testler "assertion" ile kalmalı. RED aşamasında yalnız test_yollari altına ve yalnız ekleme yapılabilsin.
- **AK-03:** Test yapılandırma dosyalarını koru. Koşan test sayısı RED'dekinden az olamasın.
- **AK-07:** Gözden geçiricinin onayını her kabul ölçütü eşleşmesiyle deterministik olarak doğrula.
- **AK-10:** Rejected ya da zaman aşımında otomatik revert PR aç, ya da görev başına özellik bayrağı kullan.

**Paralellik ve alpha**
- **AK-28:** GitHub merge queue (`merge_group`) ya da proje başına sıralı birleştirici kullan.
- **AK-29:** Alpha doğrulamasını SHA eşitliği yerine "içeriyor mu" diye yap (compare API).
- **AK-30:** main CI'ını iptal etme. Alpha dağıtımını CI başarısına bağla.
- **AK-31:** `/_saglik` ve duman testi ekle. Alpha kırıksa birleştirmeyi dondur ve otomatik revert aç.
- **AK-34:** Entegrasyondan sonra korunan-test referansını düzelt. Çakışma çözümünden sonra da testleri koru.

**Durum ve tutarlılık**
- **AK-43:** Rejected ve Done sinyallerini her zaman ilet. Birleştirmeden önce Plane durumunu yeniden oku. İptalde PR'ı kapat.
- **AK-44:** Görev başına kalıcı defter tut (bütçe, insan_devam). Her sonlanışta Plane'i güncelle.
- **AK-45:** Katılım etiketi ya da ayrı bir "Agent Ready" durumu kullan. Atananları ezme.
- **AK-46:** Plan onayı sessizce atlanıyor, çünkü `onay` durumu tanımlı değil. Açılışta yapılandırmayı doğrula.
- **AK-54:** Bütün sorumlu kimlikleri boş, atama sessizce atlanıyor. Açılışta doğrula.

**Plane**
- **AK-24:** Tek hız sınırlayıcı (token kovası) kullan ve `Retry-After`'a uy. İnsan paketleri için sabırlı yeniden deneme uygula.
- **AK-25:** Uzlaştırıcı işin gerçek durumunu denetlesin ve imleçli sayfalama yapsın. Plane 1.4.2'nin state filtresini sözleşme testiyle doğrula.

**Kaynak ve maliyet**
- **AK-13:** Disk bölümlerini ayır, kota koy, `/tmp`'yi tmpfs yap.
- **AK-16:** Yuvayı adet yerine GB cinsinden bellek bütçesi olarak say. Altyapı süreçlerine OOM koruması ver.
- **AK-50:** Uygulanmayan tavanları uygula:
  - ART WIP'i Temporal'da uygula;
  - bütçeyi çağrıdan **önce** denetle;
  - sağlayıcı konsolunda aylık limit koy;
  - API katmanını S0'da yükselt. Start katmanı (500 $/ay), 12 ekiple ilk gün biter.

**Operasyon**
- **AK-56:** Postgres için WAL arşivi, günlük yedek ve geri yükleme tatbikatı kur. auto-setup yerine kontrollü şema göçü yap.

## Karşılananlar (hakkı verilmeli)

- CI şablonunda `pull_request_target` yok. Eylemler SHA ile sabitlenmiş (`ci.yml:4-9,18-21`).
- Sandbox şu korumalarla başlıyor: `cap-drop ALL`, `no-new-privileges`, pids ve bellek sınırı, uid 1000, `.git` salt okunur. Planlayıcı, gözden geçirici ve çözücü depoyu salt okunur görüyor (`faaliyetler/sandbox.py:100-111`). Gerçek Docker ile testleri var (`tests/test_entegrasyon.py`).
- Korunan yollar ve RED sonrası test değişikliği yasağı deterministik kapı. Hileli uygulayıcı testi var (`tests/test_entegrasyon.py:98-106`). Ancak AK-02, AK-03 ve AK-34'teki boşluklar bu korumayı deliyor.
- Webhook hemen 2xx dönüyor; HMAC denetleniyor; boş sır reddediliyor (`giris/app.py:133-146`, `giris/plane_olay.py:21-25`).
- Sağlayıcı yoğunluğu ile ajan başarısızlığı ayrılıyor. OOM'da profil artıyor. Takılınca çözücü devreye giriyor. Sınırlı döngü var. Hepsi zaman atlamalı Temporal testleriyle sınanıyor (`tests/test_akis.py`).
- Commit kimliği yapılandırmadan geliyor; ortak yazar satırı yok (`faaliyetler/depo.py:33-37`, `e2e/surucu.py:99-101`). Tek istisna AK-42: GitHub API ile yapılan squash birleştirmede committer GitHub oluyor. Bu, kişisel politikanın "committer = karacaismail" kuralıyla çelişir. Ya fast-forward itme kullanılmalı ya da kullanıcıdan açık istisna alınmalı.

## Pilotun kök nedenleriyle karşılaştırma (A0)

| Pilot kök nedeni | Bu sistemde durum | Açık kalan |
|---|---|---|
| KN-1: elle yazılmış dayanıklılık | Çözüldü (Temporal) | Sürümleme ve şema hatası yeni sessiz takılma kaynağı (AK-19, AK-20) |
| KN-2: sürüm kontrolü dışı yamalar | Çekirdek küçük, testli | Politika anlık görüntüsü kısmi (AK-47); sürümleme kuralı yok (AK-19) |
| KN-4: oracle eksik | Form, önce test, korunan test | RED ve korunan-test delikleri; insan onayı kanıtsız; kod insan testinden önce birleşiyor (AK-01/02/03/09/10) |
| KN-5: sağlayıcı kapasitesi | Yoğunluk sessizce yeniden deneniyor | Yanlış sınıflandırma ve sayılmayan maliyet (AK-21, AK-49); toplu tavan (AK-22) |
| KN-7: adaptive bütçe | Sert tavan var | ART WIP ve bütçesi uygulanmıyor; yeniden koşuda sıfırlanıyor (AK-44, AK-50) |
| KN-8: Plane 429, bayat durum | Uzlaştırıcı ve gözcü var | 429'da bildirimler yutuluyor; gözcü elle çalışıyor (AK-24, AK-57) |

## Doğrulanması gereken varsayımlar

Bunlar koddan kesin olarak çıkarılamıyor; S0'da gerçek ortamda sınanmalı.

- **AK-25:** Plane CE 1.4.2 `/issues/?state=` filtresini uyguluyor mu? Filtre uygulanmazsa uzlaştırıcı her işi "In Progress" sanar.
- **AK-37:** Compose, hiçbir servisin kullanmadığı `sandbox` ağını oluşturuyor mu?
- **AK-42:** API ile squash birleştirmede author ve committer alanları hangi kimlikle yazılıyor?
- **AK-61:** Actions eşzamanlı iş sınırı ve GitHub API birincil sınırı hangi plan ve kimlikle geçerli?

## Önerilen sıra

1. **S0 (0–2 hafta):**
   - Önce güvenlik: AK-35, AK-36, AK-37, AK-38.
   - Sonra sessiz takılma: AK-18, AK-19, AK-20, AK-21, AK-57.
   - Sonra yapılandırma doğrulaması: AK-46, AK-54.
   - Ardından tek ekip, tek proje, 10 düşük riskli görev.
2. **Birden çok ekibi açmadan önce:**
   - oracle maddeleri: AK-01, AK-02, AK-03, AK-07;
   - birleştirme ve alpha maddeleri: AK-10, AK-28, AK-29, AK-30, AK-31, AK-34;
   - durum maddeleri: AK-43, AK-44, AK-45;
   - Plane: AK-24, AK-25;
   - kaynak ve maliyet: AK-13, AK-16, AK-50;
   - yedek: AK-56.
3. **Açılış sınırı:** Birleştirme kuyruğu, alpha sağlık kontrolü, dondurma ve revert hazır olmadan 3'ten fazla ekibi aynı alpha main'e açmayın.
