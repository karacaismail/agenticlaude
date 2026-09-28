import { useMemo, useState } from 'react';
import { Anchor, Badge, Button, Chip, Group, Paper, Select, Stack, Table, Text, TextInput, Tooltip, useComputedColorScheme } from '@mantine/core';
import { IconListDetails, IconSearch } from '@tabler/icons-react';
import { useTuretilen } from '../durum/kanca';
import { HUKUM, SEVIYE_AD, SEVIYE_RENK } from '../bilesenler/ortak';
import { GrafikKarti } from '../bilesenler/GrafikKarti';
import { SayfaBasligi, Bolum } from '../bilesenler/SayfaBasligi';
import { useKanit, KanitSayilari } from '../bilesenler/Kanit';
import { isiHaritasi, yatayCubuk } from '../grafik/secenekler';
import { DURUM_RENK, grafikTemasi } from '../tema';
import { CERCEVELER } from '../veri/teknolojiler';
import { aracKanitlari } from '../veri/kanit';
import veri from '../veri/uretilen.json';

const SEVIYE_GRAFIK: Record<string, string> = { kritik: DURUM_RENK.kritik, yuksek: DURUM_RENK.ciddi, orta: DURUM_RENK.uyari, dusuk: DURUM_RENK.iyi };

export function Teknolojiler() {
  const t = useTuretilen();
  const { kanitAc } = useKanit();
  const koyu = useComputedColorScheme('light') === 'dark';
  const g = grafikTemasi(koyu);
  const [ara, setAra] = useState('');
  const [kategori, setKategori] = useState<string | null>(null);
  const [hukumler, setHukumler] = useState<string[]>(['kullan', 'aday', 'sinirli', 'kullanma', 'disi']);
  const riskli = t.teknolojiler.filter((x) => x.riskPuani !== undefined).sort((a, b) => (b.riskPuani ?? 0) - (a.riskPuani ?? 0));
  const katalog = useMemo(() => {
    const q = ara.trim().toLocaleLowerCase('tr-TR');
    return veri.katalog.araclar.filter((a) => (!kategori || a.kategori === kategori) && hukumler.includes(a.hukum) &&
      (!q || `${a.ad} ${a.ne} ${a.uyum} ${a.dikkat}`.toLocaleLowerCase('tr-TR').includes(q)));
  }, [ara, kategori, hukumler]);
  const katAd = Object.fromEntries(veri.katalog.kategoriler.map((k) => [k.key, k.label]));
  const c1 = veri.c1Matris;
  const rler = Object.keys(c1.gereksinimler);
  const adaylar = [...c1.adaylar].sort((a, b) => b.toplam - a.toplam);
  const c1Veri: [number, number, number][] = [];
  adaylar.forEach((a, yi) => rler.forEach((r, xi) => c1Veri.push([xi, yi, Number((a.puan as Record<string, number>)[r] ?? 0)])));
  const ac = (ad: string) => kanitAc({ baslik: ad, alt: 'Bu aracın adını ya da konusunu taşıyan bulgular', liste: aracKanitlari(ad) });

  return (
    <Stack gap={32} className="sayfa">
      <SayfaBasligi ust="Kanıt" baslik="Teknolojiler"
        aciklama="Seçtiğin senaryonun yığını, her aracın risk puanı ve bulguları; C1'in hazır sistem matrisi ve senin 127 araçlık kataloğun. Katalogdaki hükümler 23.09 raporuna aittir; bulgu değildir." />

      <Bolum baslik="Bu senaryonun yığını" aciklama="Satırdaki düğme o araca ait bütün bulguları açar.">
        <Paper withBorder p="md">
          <Table.ScrollContainer minWidth={760}>
            <Table striped highlightOnHover fz="sm" verticalSpacing="xs">
              <Table.Thead><Table.Tr><Table.Th>Teknoloji</Table.Th><Table.Th>Rolü</Table.Th><Table.Th>Risk puanı</Table.Th><Table.Th>Bulgular</Table.Th><Table.Th><Tooltip label="Senin panolarından türetilen 23.09 raporunun hükmü"><span>23.09 hükmü</span></Tooltip></Table.Th></Table.Tr></Table.Thead>
              <Table.Tbody>
                {t.teknolojiler.map((x) => {
                  const b = aracKanitlari(x.ad);
                  return (
                    <Table.Tr key={x.ad}>
                      <Table.Td fw={600}>{x.ad}</Table.Td>
                      <Table.Td>{x.rol}</Table.Td>
                      <Table.Td>{x.riskPuani !== undefined ? <Badge variant="light" color={SEVIYE_RENK[x.riskSeviye ?? 'orta']}>{x.riskPuani} · {SEVIYE_AD[x.riskSeviye ?? 'orta']}</Badge> : <Text size="xs" c="dimmed">—</Text>}</Table.Td>
                      <Table.Td>{b.length ? <Group gap={6} wrap="nowrap"><Button size="compact-xs" variant="light" leftSection={<IconListDetails size={12} />} onClick={() => ac(x.ad)}>{b.length}</Button><KanitSayilari liste={b} enFazla={2} /></Group> : <Text size="xs" c="dimmed">—</Text>}</Table.Td>
                      <Table.Td>{x.hukum ? <Text size="xs" c="dimmed">{HUKUM[x.hukum]?.ad}</Text> : <Text size="xs" c="dimmed">—</Text>}</Table.Td>
                    </Table.Tr>
                  );
                })}
              </Table.Tbody>
            </Table>
          </Table.ScrollContainer>
          <Text size="xs" c="dimmed" mt="xs">Risk puanı 0–100; risk haritasının yöntemiyle (güvenlik geçmişi, bakım, lisans, sahiplik, işletim) hesaplandı.</Text>
        </Paper>
      </Bolum>

      {riskli.length > 0 && (
        <GrafikKarti baslik="Bu yığının risk puanları" aciklama="Renk risk seviyesini gösterir; değer çubuğun ucunda yazılı." kaynak="risk-haritasi/00-risk-haritasi.json"
          secenek={yatayCubuk(g, riskli.map((x) => x.ad), riskli.map((x) => x.riskPuani ?? 0), { renkler: riskli.map((x) => SEVIYE_GRAFIK[x.riskSeviye ?? 'orta']) })}
          yukseklik={Math.max(180, riskli.length * 26)}
          tablo={{ basliklar: ['Teknoloji', 'Puan', 'Seviye'], satirlar: riskli.map((x) => [x.ad, x.riskPuani ?? '', SEVIYE_AD[x.riskSeviye ?? ''] ?? '']) }} />
      )}

      <Bolum baslik="Hazır sistemler: 32 aday × 12 gereksinim" aciklama="C1 araştırmasının puanları: 0 yok, 1 kısmen, 2 tam. Her puanın kanıt metni Bulgular sayfasında (kaynak: Hazır sistemler).">
        <GrafikKarti baslik="Gereksinim karşılama matrisi" aciklama={`En yüksek toplam ${adaylar[0].toplam}/24 (${adaylar[0].ad}). 12 gereksinimin hepsinde tam puan alan aday yok.`} kaynak="mimari-haritasi/arastirma/C1-hazir-sistemler.json"
          secenek={isiHaritasi(g, rler, adaylar.map((a) => `${a.ad.slice(0, 34)} (${a.toplam})`), c1Veri)} yukseklik={760}
          tablo={{ basliklar: ['Aday', ...rler, 'Toplam'], satirlar: adaylar.map((a) => [a.ad, ...rler.map((r) => Number((a.puan as Record<string, number>)[r] ?? 0)), a.toplam]) }}
          ek={<Paper withBorder p="sm" radius="md" className="gereksinim-listesi"><Stack gap={2}>{rler.map((r) => <Text key={r} size="xs"><b>{r}:</b> {(c1.gereksinimler as Record<string, string>)[r]}</Text>)}</Stack></Paper>} />
      </Bolum>

      <Bolum baslik="Çerçeveler ve protokoller">
        <Paper withBorder p="md"><Stack gap={4}>{CERCEVELER.map((c) => <Text key={c.ad} size="sm"><b>{c.ad}:</b> {c.rol}</Text>)}</Stack></Paper>
      </Bolum>

      <Bolum baslik="Senin araç kataloğun (127)" aciklama="agentic-stack-docs kataloğu. Hüküm sütunu 23.09 raporunun değerlendirmesidir; bulgular düğmesi kaynaklardaki kayıtları açar.">
        <Paper withBorder p="md">
          <Group gap="sm" mb="sm">
            <TextInput size="xs" w={240} placeholder="Ara" leftSection={<IconSearch size={14} />} value={ara} onChange={(e) => setAra(e.currentTarget.value)} />
            <Select size="xs" w={220} placeholder="Kategori" clearable value={kategori} onChange={setKategori} data={veri.katalog.kategoriler.map((k) => ({ value: k.key, label: k.label }))} />
            <Chip.Group multiple value={hukumler} onChange={setHukumler}>
              <Group gap={4}>{Object.entries(HUKUM).map(([k, h]) => <Chip key={k} value={k} size="xs" variant="light">{h.ad}</Chip>)}</Group>
            </Chip.Group>
            <Text size="xs" c="dimmed">{katalog.length} araç</Text>
          </Group>
          <Table.ScrollContainer minWidth={980}>
            <Table fz="xs" verticalSpacing={6} striped highlightOnHover>
              <Table.Thead><Table.Tr><Table.Th>Araç</Table.Th><Table.Th>Kategori</Table.Th><Table.Th>Bu hatta yeri (23.09)</Table.Th><Table.Th>Dikkat (23.09)</Table.Th><Table.Th>Risk</Table.Th><Table.Th>Bulgular</Table.Th><Table.Th>23.09 hükmü</Table.Th></Table.Tr></Table.Thead>
              <Table.Tbody>
                {katalog.map((a) => {
                  const n = aracKanitlari(a.ad).length;
                  return (
                    <Table.Tr key={a.ad}>
                      <Table.Td fw={600}>{a.url ? <Anchor href={a.url} target="_blank" rel="noreferrer" size="xs">{a.ad}</Anchor> : a.ad}</Table.Td>
                      <Table.Td>{katAd[a.kategori] ?? a.kategori}</Table.Td>
                      <Table.Td>{a.uyum || a.ne}</Table.Td>
                      <Table.Td>{a.dikkat}</Table.Td>
                      <Table.Td>{a.risk ? <Badge size="xs" variant="light" color={SEVIYE_RENK[a.risk.seviye]}>{a.risk.puan}</Badge> : '—'}</Table.Td>
                      <Table.Td>{n ? <Button size="compact-xs" variant="subtle" onClick={() => ac(a.ad)}>{n}</Button> : '—'}</Table.Td>
                      <Table.Td><Text size="xs" c="dimmed">{HUKUM[a.hukum]?.ad}</Text></Table.Td>
                    </Table.Tr>
                  );
                })}
              </Table.Tbody>
            </Table>
          </Table.ScrollContainer>
        </Paper>
      </Bolum>
    </Stack>
  );
}
