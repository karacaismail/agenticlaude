import { useState } from 'react';
import { Grid, Group, NumberInput, Paper, SimpleGrid, Stack, Text, Title, useComputedColorScheme } from '@mantine/core';
import { SayfaBasligi } from '../bilesenler/SayfaBasligi';
import { GrafikKarti } from '../bilesenler/GrafikKarti';
import { isiHaritasi, yatayCubuk, yigilmisYatay } from '../grafik/secenekler';
import { DURUM_RENK, grafikTemasi } from '../tema';
import { KESTRA_KATEGORI } from '../veri/sorunlar';
import { HUKUM } from '../bilesenler/ortak';
import veri from '../veri/uretilen.json';

const sayi = (n: number) => n.toLocaleString('tr-TR');
// C6: C derleyicisi vakasından türetilmiş kaba tahmin (16 ajan, 2 hafta, 20.000 $) → ajan-saat ~3,72 $.
const AJAN_SAAT_USD = 3.72;

export function Istatistikler() {
  const koyu = useComputedColorScheme('light') === 'dark';
  const g = grafikTemasi(koyu);
  const [ajan, setAjan] = useState(3);
  const [saat, setSaat] = useState(8);
  const [gun, setGun] = useState(22);

  // Kestra kök nedenleri: 6 grup
  const kGrup: Record<string, number> = {};
  for (const n of veri.kestra.nedenler) kGrup[KESTRA_KATEGORI[n.id]] = (kGrup[KESTRA_KATEGORI[n.id]] ?? 0) + 1;
  const kSirali = Object.entries(kGrup).sort((a, b) => b[1] - a[1]);

  // D1 ısı haritası
  const d1Siniflar = veri.d1.siniflar.map((s) => s.ad);
  const d1Veri = veri.d1.matris.map(([si, mi, v]) => [mi, si, v] as [number, number, number]);

  // D2 ve B2
  const d2 = veri.d2.siniflar.map((s) => [s.ad, s.kayitlar.length] as const).sort((a, b) => b[1] - a[1]);
  const b2 = veri.b2.siniflar.map((s) => [s.ad, s.vakalar.length] as const);

  // B3 sınıf × öncelik
  const b3Sinif = Array.from(new Set(veri.b3.kipler.map((k) => k.sinif)));
  const b3Say = (s: string, o: string) => veri.b3.kipler.filter((k) => k.sinif === s && k.oncelik === o).length;
  const b3Sirali = [...b3Sinif].sort((a, b) => veri.b3.kipler.filter((k) => k.sinif === b).length - veri.b3.kipler.filter((k) => k.sinif === a).length);

  // Risk türleri
  const rt = [...veri.risk.turler].sort((a, b) => b.bulgu - a.bulgu);

  // Katalog kategori × hüküm
  const katAd = Object.fromEntries(veri.katalog.kategoriler.map((k) => [k.key, k.label]));
  const kategoriler = Object.keys(katAd).filter((k) => veri.katalog.araclar.some((a) => a.kategori === k))
    .sort((a, b) => veri.katalog.araclar.filter((x) => x.kategori === b).length - veri.katalog.araclar.filter((x) => x.kategori === a).length);
  const hukumRenk: Record<string, string> = { kullan: DURUM_RENK.iyi, aday: g.seri[0], sinirli: DURUM_RENK.uyari, kullanma: DURUM_RENK.kritik, disi: g.notr };

  // İhtiyaç alanları
  const alan = Object.entries(veri.ihtiyac.alan).map(([k, v]) => [k.replace(/^[A-F]-/, '').replace(/-/g, ' '), v as number] as const);

  const aylik = Math.round(ajan * saat * gun * AJAN_SAAT_USD);

  return (
    <Stack gap="lg" className="sayfa">
      <SayfaBasligi ust="Kanıt" baslik="İstatistikler" aciklama="Bütün sayılar araştırma dosyalarından hesaplandı (scripts/veri-uret.mjs). Her grafiğin tablo görünümü var." />

      <Paper withBorder p="md" radius="md">
        <Title order={3} mb="xs">Senin Kestra pilotun</Title>
        <SimpleGrid cols={{ base: 2, sm: 3, lg: 6 }} mb="md">
          {[
            { d: '98 modül', a: '~27 bin satır, 7 günde', k: 'A0' },
            { d: '0 / 4', a: 'kök görev müdahalesiz üretime çıktı', k: 'A0' },
            { d: '330', a: 'kapasite hatası, tek abonelik hesabında', k: 'A0' },
            { d: '46 · 47', a: 'ERROR ve yeniden başlatma', k: 'KP-07' },
            { d: '4.762', a: 'CLAIM olayı: ilerlemesiz döngü', k: 'KP-12' },
            { d: '7 gün', a: 'kabul sahipsiz bekledi (P7D)', k: 'KP-15' },
          ].map((x) => (
            <Paper key={x.a} withBorder p="sm" radius="md">
              <div className="kpi-deger">{x.d}</div>
              <Text size="xs" c="dimmed">{x.a}</Text>
              <Text size="xs" c="dimmed">Kaynak: {x.k}</Text>
            </Paper>
          ))}
        </SimpleGrid>
        <GrafikKarti baslik="20 kök neden, 6 grupta" aciklama="En çok ders durum/orkestrasyon, işletim ve kapasite tarafında." kaynak="mimari-haritasi/pilot-dersleri.json (A0 + E6)"
          secenek={yatayCubuk(g, kSirali.map((x) => x[0]), kSirali.map((x) => x[1]))} yukseklik={220}
          tablo={{ basliklar: ['Grup', 'Kök neden'], satirlar: kSirali.map((x) => [x[0], x[1]]) }} />
      </Paper>

      <GrafikKarti baslik="Dünyada orkestratör hataları: motor × sınıf" aciklama={`${veri.d1.toplam} kayıt, 9 iş akışı motoru. En sık sınıf: takılı / zombi çalışma.`}
        kaynak="mimari-haritasi/arastirma/D1-orkestrator-hatalari.json" yukseklik={460}
        secenek={isiHaritasi(g, veri.d1.motorlar, d1Siniflar, d1Veri)}
        tablo={{ basliklar: ['Sınıf', ...veri.d1.motorlar], satirlar: d1Siniflar.map((s, si) => [s, ...veri.d1.motorlar.map((_, mi) => d1Veri.find((v) => v[0] === mi && v[1] === si)?.[2] ?? 0)]) }} />

      <Grid gutter="md">
        <Grid.Col span={{ base: 12, lg: 6 }}>
          <GrafikKarti baslik="Ajan platformu hataları: sınıfa göre" aciklama={`${veri.d2.toplam} kayıt, 8 platform; ayrıca ${veri.d2.dikisler.length} bağlantı noktası hatası.`} kaynak="D2-ajan-platformu-hatalari.json"
            secenek={yatayCubuk(g, d2.map((x) => x[0]), d2.map((x) => x[1]))} yukseklik={300}
            tablo={{ basliklar: ['Sınıf', 'Kayıt'], satirlar: d2.map((x) => [x[0], x[1]]) }} />
        </Grid.Col>
        <Grid.Col span={{ base: 12, lg: 6 }}>
          <GrafikKarti baslik="Gerçek vakalar: sınıfa göre" aciklama={`${veri.b2.toplam} vaka, 16 sınıf.`} kaynak="B2-vaka-katalogu.json"
            secenek={yatayCubuk(g, b2.map((x) => x[0]), b2.map((x) => x[1]))} yukseklik={420}
            tablo={{ basliklar: ['Sınıf', 'Vaka'], satirlar: b2.map((x) => [x[0], x[1]]) }} />
        </Grid.Col>
      </Grid>

      <GrafikKarti baslik="Ön-ölüm: öngörülen arızalar" aciklama={`${veri.b3.kipler.length} arıza kipi; ${veri.b3.kipler.filter((k) => k.oncelik === 'mvp-oncesi').length}'u ilk koşudan önce şart.`} kaynak="B3-on-olum.json"
        secenek={yigilmisYatay(g, b3Sirali, [
          { ad: 'MVP öncesi şart', veri: b3Sirali.map((s) => b3Say(s, 'mvp-oncesi')), renk: g.kademe[3] },
          { ad: 'S1', veri: b3Sirali.map((s) => b3Say(s, 'S1')), renk: g.kademe[1] },
          { ad: 'S2', veri: b3Sirali.map((s) => b3Say(s, 'S2')), renk: g.kademe[0] },
        ], { etiketGenislik: 120 })} yukseklik={330}
        tablo={{ basliklar: ['Sınıf', 'MVP öncesi', 'S1', 'S2'], satirlar: b3Sirali.map((s) => [s, b3Say(s, 'mvp-oncesi'), b3Say(s, 'S1'), b3Say(s, 'S2')]) }} />

      <GrafikKarti baslik="Risk haritası: risk türüne göre bulgu" aciklama={`${sayi(veri.risk.toplamBulgu)} bulgu, ${sayi(veri.risk.toplamArac)} araç; ${veri.risk.derin} araç derin incelendi.`} kaynak="risk-haritasi/00-risk-haritasi.json" yukseklik={500}
        secenek={yigilmisYatay(g, rt.map((r) => r.ad), [
          { ad: 'Kritik', veri: rt.map((r) => r.kritik), renk: g.kademe[3] },
          { ad: 'Yüksek', veri: rt.map((r) => r.yuksek), renk: g.kademe[2] },
          { ad: 'Orta ve düşük', veri: rt.map((r) => r.bulgu - r.kritik - r.yuksek), renk: g.kademe[0] },
        ], { etiketGenislik: 260 })}
        tablo={{ basliklar: ['Risk türü', 'Kritik', 'Yüksek', 'Toplam'], satirlar: rt.map((r) => [r.ad, r.kritik, r.yuksek, r.bulgu]) }} />

      <Grid gutter="md">
        <Grid.Col span={{ base: 12, lg: 7 }}>
          <GrafikKarti baslik="Senin kataloğun: kategori ve hüküm" aciklama={`${veri.katalog.araclar.length} araç. Hüküm renkleri: yeşil önerilen, mavi aday, sarı sınırlı, kırmızı önerilmez, gri gereksiz.`} kaynak="agentic-stack-docs katalog" yukseklik={560}
            secenek={yigilmisYatay(g, kategoriler.map((k) => katAd[k]), Object.keys(HUKUM).map((h) => ({ ad: HUKUM[h].ad, veri: kategoriler.map((k) => veri.katalog.araclar.filter((a) => a.kategori === k && a.hukum === h).length), renk: hukumRenk[h] })), { etiketGenislik: 180 })}
            tablo={{ basliklar: ['Kategori', ...Object.values(HUKUM).map((h) => h.ad)], satirlar: kategoriler.map((k) => [katAd[k], ...Object.keys(HUKUM).map((h) => veri.katalog.araclar.filter((a) => a.kategori === k && a.hukum === h).length)]) }} />
        </Grid.Col>
        <Grid.Col span={{ base: 12, lg: 5 }}>
          <Stack gap="md">
            <GrafikKarti baslik="İhtiyaç haritası: alana göre" aciklama={`${veri.ihtiyac.toplam} ihtiyaç; ${veri.ihtiyac.zorunluluk.zorunlu}'i zorunlu.`} kaynak="ihtiyac-haritasi/00-indeks.json"
              secenek={yatayCubuk(g, alan.map((x) => x[0]), alan.map((x) => x[1]), { etiketGenislik: 170 })} yukseklik={220}
              tablo={{ basliklar: ['Alan', 'İhtiyaç'], satirlar: alan.map((x) => [x[0], x[1]]) }} />
            <Paper withBorder p="md" radius="md">
              <Title order={4}>Model maliyeti: kaba tahmin</Title>
              <Text size="sm" c="dimmed" mb="xs">Ajan-saat başına ~3,72 $ (C derleyicisi vakasından türetilmiş; 5–9 kat belirsiz, önce ölçülmeli · C6).</Text>
              <Group grow>
                <NumberInput size="xs" label="Eşzamanlı ajan" min={1} max={144} value={ajan} onChange={(v) => setAjan(Number(v) || 1)} />
                <NumberInput size="xs" label="Günde saat" min={1} max={24} value={saat} onChange={(v) => setSaat(Number(v) || 1)} />
                <NumberInput size="xs" label="Ayda gün" min={1} max={31} value={gun} onChange={(v) => setGun(Number(v) || 1)} />
              </Group>
              <Group mt="sm" align="baseline" gap="xs">
                <Text className="kpi-deger">{sayi(aylik)} $</Text><Text size="sm" c="dimmed">/ ay tahmini</Text>
              </Group>
              <Text size="sm" mt={4}>
                Start tavanı 500 $: {aylik > 500 ? <b style={{ color: DURUM_RENK.kritik }}>aşılır</b> : 'yeter'} · Build tavanı 1.000 $: {aylik > 1000 ? <b style={{ color: DURUM_RENK.kritik }}>aşılır</b> : 'yeter'} · Scale tavanı 200.000 $.
              </Text>
              <Text size="xs" c="dimmed" mt={4}>Tavanda istekler ay sonuna kadar 429 döner ve bütün filo durur (C6). İnsan maliyeti dahil değil.</Text>
            </Paper>
          </Stack>
        </Grid.Col>
      </Grid>
    </Stack>
  );
}
