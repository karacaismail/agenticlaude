# Devir-teslim sözleşmesi

**Devreden:** Claude oturumu `7a4b6767-b601-440c-8aa0-f0d532adc038`, 27.09.2026
**Devralan:** Kullanıcının yeni hesabındaki Claude (ya da başka bir yapay zekâ asistanı)
**Proje kökü:** `/Users/w6x/Documents/otomasyon coding`

Bu belge bir sözleşmedir. Devralan taraf buradaki kurallara uyar, okuma sırasını izler ve bir işe başlamadan önce §2'deki teyidi yapar.

---

## 1. Nereden başlanır? (okuma sırası)

| Sıra | Dosya | Neden |
|---|---|---|
| 1 | `devir-teslim/DEVIR-TESLIM.md` (bu dosya) | Kurallar ve nasıl devam edileceği |
| 2 | `devir-teslim/THREAD-OZETI.md` | Kullanıcının sorduğu 21 soru, ne istediği, ne eksik kaldığı, asıl sorun, açık kararlar |
| 3 | `devir-teslim/SOHBETTE-KALAN-BULGULAR.md` | Dosyalarda olmayan kurallar, ortam ayarları, pilot gerçekleri, tehlikeli betikler |
| 4 | `devir-teslim/00-harita.json` | Hangi klasörde ne var, kim üretti, durumu ne |
| 5 | `mimari-haritasi/arastirma/*-ozet.md` (A1…E6) | Araştırmaların Türkçe özetleri; ayrıntı ilgili JSON'larda |
| 6 | `mimari-haritasi/00-mimari.json`, `kararlar.json`, `pilot-dersleri.json`, `dogrulama.json`, `codex-eklemeleri.json` | Mimari kayıt |
| 7 | `agentic-fabrika/README.md` ve `docs/` | Fabrika kodunun ne yaptığı ve nasıl çalıştırılacağı |
| 8 | Gerekirse: `ihtiyac-haritasi/00-indeks.json`, `arac-haritasi/00-harita.json`, `risk-haritasi/00-risk-haritasi.json` | Haritaların giriş noktaları |

Ayrıntı gerektiğinde bakılacak yer, bu oturumun tam dökümü. Dosya büyüktür; yalnız okunur ve baştan sona okunmaz, içinde arama yapılır:
`/Users/w6x/.claude/projects/-Users-w6x-Documents-otomasyon-coding/7a4b6767-b601-440c-8aa0-f0d532adc038.jsonl`

---

## 2. İşe başlamadan önce teyit

Devralan taraf ilk mesajında, hiçbir araç çalıştırmadan veya dosya değiştirmeden önce, kullanıcıya Türkçe ve en fazla 8 satırda üç şeyi yazar:

1. projenin amacı,
2. asıl sorun (`THREAD-OZETI.md` §6),
3. açık kararlar (`THREAD-OZETI.md` §7).

Ardından kullanıcıdan ne yapılacağını bekler. Kendiliğinden iş başlatmaz.

---

## 3. Hafızaya alınacaklar

**Aynı Mac ve aynı macOS kullanıcısında** hafıza dosyaları şu klasörde durur ve hesap değişse de korunur:
`/Users/w6x/.claude/projects/-Users-w6x-Documents-otomasyon-coding/memory/`

Devralan taraf bu dosyaların varlığını kontrol eder. Eksik olan varsa ya da başka bir makineye/araca geçildiyse, aşağıdaki kayıtlar aynen oluşturulur.

1. **proje-amaci:** Amaç, kullanıcının sözleriyle: "insanların ve yapay zekâ ajanlarının birlikte, birden fazla ekip üzerinden güvenilir yazılım üretebildiği bir çalışma sistemi kurmak". Dört dayanak: insan–ajan birlikte çalışma, çok ekip, güvenilir yazılım, çalışan sistem. İnsan yalnız onaylayan değil, eş üreticidir.
2. **ihtiyac-haritasi-kurallari:**
   - İhtiyaç metinleri markasızdır.
   - Araçlar `arac-haritasi/`, riskler `risk-haritasi/` altında ayrı tutulur.
   - Projelendirilmez, ama projelendirme için hiçbir şey eksik bırakılmaz.
   - Araştırma derin, tekrarlı ve doğrulanmış olur.
   - Kullanıcının özgün kaynak dosyaları değiştirilmez.
3. **yalniz-isteneni-yap:** Yalnız istenen yapılır. İstenmemiş kod değişikliği, dosya ekleme ya da denetim yapılmaz. Örnekler (ekran görüntüsü, araç adları, prototip) bağlamdır. Önerilecek bir şey varsa tek satırla sorulur ve beklenir. Kullanıcı token'ları parayla alıyor.
4. **arastirma-istegi-kapsami:** Araştırma sorusuna yalnız araştırma cevabı verilir. Önceki "kur" talimatları yeni bir araştırma sorusuna taşınmaz.
5. **dil-turkce:** Kullanıcıya her mesaj Türkçe yazılır.
6. **codex-dizini-salt-okunur:** `/Users/w6x/Documents/otomasyon coding 2` Codex'in çalışma dizinidir. Oradan yalnız okunur ve kopyalanır; yazma, silme, değiştirme ve orada betik çalıştırma yoktur. Codex orada paralel çalışıyor.
7. **devir-teslim:** Projenin durumu ve devir-teslim paketi `devir-teslim/` altındadır. İş yapıldıkça `00-harita.json` ve `THREAD-OZETI.md` güncellenir.

Kullanıcının genel talimat dosyaları (`/Users/w6x/.claude/CLAUDE.md` ve `/Users/w6x/AGENTS.md`) git kimliği ve Colima kurallarını zaten içerir. Bu kurallar `SOHBETTE-KALAN-BULGULAR.md` §1'de de yazılı.

---

## 4. Sözleşme maddeleri

**Yapılacaklar**

- Her mesaj Türkçe yazılır ve kısa tutulur. Kullanıcı developer değil: kararlar ona seçenekler ve öneriyle sunulur.
- Yalnız istenen iş yapılır. Kapsam dışı bir fikir tek satırla sorulur.
- Araştırmada her iddianın kaynağı gösterilir. Doğrulanamayan iddia "doğrulanamadı" diye işaretlenir. Sayı uydurulmaz.
- Bir dosyayı değiştirmeden önce içeriğine bakılır. Yalnız ekleme yapılır; mevcut içerik silinmez. Olgusal bir hata düzeltildiğinde kayda geçirilir.
- Haritalara ekleme yapıldığında ilgili `00-*.json` sayaçları güncellenir ve JSON geçerliliği denetlenir.
- Konteyner işleri Colima ile yapılır (`SOHBETTE-KALAN-BULGULAR.md` §2).
- Uzun alt ajan işlerinde adımlar küçük tutulur, ara sonuçlar sık yazılır, toplu karşılaştırmalar betikle yapılır.
- İş bittiğinde `devir-teslim/00-harita.json` güncellenir.

**Yapılmayacaklar**

- Codex dizinine, `~/Developer/software-factory` pilotuna ve kullanıcının özgün kaynak dosyalarına yazılmaz.
- `.env` ve kimlik bilgisi dosyaları açılmaz. Kimlik bilgisi hiçbir forma girilmez.
- Git kimlik koruması atlatılmaz. Commit'e yapay zekâ ortak yazarı eklenmez. Kullanıcı istemedikçe git işlemi yapılmaz.
- Docker Desktop önerilmez.
- `calisma-arsivi/` içindeki eski birleştirme betikleri çalıştırılmaz (`arac/birlestir.py`, `risk/risk_birlestir.py`). Güncel haritaların üzerine yazarlar.
- Kullanıcı açıkça istemedikçe `agentic-fabrika` kodu değiştirilmez. S9'daki değişiklikler için karar hâlâ bekliyor.
- Yayınlanmış sayfalar kullanıcı istemeden güncellenmez.

---

## 5. Mevcut durum

| Alan | Durum | Not |
|---|---|---|
| İhtiyaç haritası | 395 ihtiyaç, 35 küme; HTML yerelde güncel | Yayınlanan sayfa eski |
| Araç haritası | 4.404 araç, 25 döngü (D15 dahil) | Glean/Faker'da birleştirme hatası şüphesi |
| Risk haritası | 2.514 bulgu, 636 derin incelenmiş araç | 22 yeni aracın risk taraması yok. KEV'li 12 bulgu için olasılık önerisi bekliyor. |
| Mimari kayıt | 21 bileşen, 25 karar, 20 kök neden, 28 önerilen kabul deneyi | Deneylerin hiçbiri çalıştırılmadı |
| Araştırma | A0–A3, B1–B3, C0–C6, D1–D2, E1–E6 | A2 tetik kuralı ve METR %19 bulgusu güncellenmeli (E5) |
| Fabrika kodu | 61 test tanımlı. Son koşu: 58 test ve uçtan uca senaryo geçti (dış servisler sahte). | Gerçek ortamda hiç koşmadı. Kod ve belgeler E4 kararlarını içermiyor. |
| Arşiv | `calisma-arsivi/2026-09-27-oturum/` (~6.900 dosya) | Oturumun geçici klasörü silinebilir; arşiv kalıcıdır |
| Codex dizini | Yalnız okundu. Codex hâlâ orada çalışıyor. | Karşılaştırma E1–E6'da |

---

## 6. Nasıl devam edilir?

Bu bölüm öneridir; kullanıcı istemeden uygulanmaz.

1. **Açık kararları kullanıcıya sor** (`THREAD-OZETI.md` §7): fabrika kodu, C0, birleştirme yöntemi, insanın rolü, HRMS çerçevesi, KEV olasılığı, yayınlanan sayfalar.
2. **Tek doğruluk kaynağı öner:** Claude ile Codex çıktıları için hangi dizinin geçerli olacağı ve bir karar günlüğü. Yedek ve sürüm kontrolü de önerilir.
3. **Kullanıcı "uygula" derse, asıl sorunu (`THREAD-OZETI.md` §6) sırayla ele al:**
   1. Tek ekip, tek proje ve düşük riskli bir görevle gerçek ortamda uçtan uca tek bir koşu. Gerçek ortam: Plane, GitHub, model ve alpha. Kapı metrikleri C6 §6'da.
   2. Kabul oracle'ının sahibinin insan olması. HRMS için mali müşavir ve İK hukukçusu altın veri setini imzalar (C5).
   3. Önce kabul deneylerinden kritik olanlar çalıştırılır: çift yazım, belirsiz etki, uzun insan beklemesi, sahipsiz bekleme (mimari-haritasi/dogrulama.json, E5).
   4. Ölçek, ölçülen kapılarla açılır: 1 → 3 → 12 → …
4. **Kullanıcının kendi yapması gereken hesap ve ayar işleri** (`THREAD-OZETI.md` §5.6) ayrı bir kontrol listesi olarak sunulur.

---

## 7. Hızlı doğrulama komutları

```bash
# Haritalardaki bütün JSON'lar geçerli mi?
cd "/Users/w6x/Documents/otomasyon coding" && python3 -B -c "
import json, os
n = 0
for d in ['ihtiyac-haritasi', 'arac-haritasi', 'risk-haritasi', 'mimari-haritasi', 'devir-teslim']:
    for r, _, fs in os.walk(d):
        for f in fs:
            if f.endswith('.json'):
                json.load(open(os.path.join(r, f))); n += 1
print(n, 'JSON dosyasi gecerli')
"
```

```bash
# Fabrika testleri (Colima)
export DOCKER_HOST=unix:///Users/w6x/.colima/factory/docker.sock
cd "/Users/w6x/Documents/otomasyon coding/agentic-fabrika" && docker build -q --build-arg GELISTIRME=1 -t fabrika-test:yerel . && docker run --rm fabrika-test:yerel python -m pytest -q
```

Docker kimlik yardımcısı hatası alınırsa `SOHBETTE-KALAN-BULGULAR.md` §2'deki `DOCKER_CONFIG` çözümü uygulanır.

---

## 8. Kabul

Devralan taraf §2'deki teyidi yazdığında bu sözleşmeyi kabul etmiş sayılır. Sözleşme ancak kullanıcının açık talimatıyla değişir.
