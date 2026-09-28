import { Anchor, Badge, Button, Grid, Group, List, Paper, SimpleGrid, Stack, Text, ThemeIcon, Timeline, Title, UnstyledButton } from '@mantine/core';
import { IconAdjustmentsHorizontal, IconArrowRight, IconFileTypePdf, IconFlag, IconListSearch, IconTarget } from '@tabler/icons-react';
import { useSayfa } from '../bilesenler/ortak';
import { useKanit } from '../bilesenler/Kanit';
import { SayfaBasligi, Bolum } from '../bilesenler/SayfaBasligi';
import { useDurum } from '../durum/depo';
import { KARARLAR, secenekEtiket } from '../veri/kararlar';
import { KURALLAR } from '../veri/kurallar';
import { SENARYOLAR } from '../veri/senaryolar';
import { KANITLAR, kanitAra } from '../veri/kanit';
import veri from '../veri/uretilen.json';

const sayi = (n: number) => n.toLocaleString('tr-TR');

// Öne çıkan bulgular: her biri kaynaktaki ifadenin sayısal özü; hüküm içermez.
const ONE_CIKAN = [
  { deger: '0 / 4', metin: 'Önceki pilotta 4 kök görevden müdahalesiz üretime çıkan olmadı; 1\'i müdahaleyle yayına çıktı, 3\'ü RC\'ye ulaştı.', kaynak: 'A0 · pilot', etiket: ['durum'] },
  { deger: '7 gün', metin: 'Pilotta kabul adımı 18.09 16:14 UTC\'den itibaren bir insan eylemini bekledi; P7D zaman aşımıyla KESTRA_FAILED oldu.', kaynak: 'E6', etiket: ['bekleme', 'insan'] },
  { deger: '87 / 98', metin: 'Pilotun 98 modülünden 87\'si git\'te izlenmiyordu; 27.294 satır, 92 Postgres tablosu, 22 Kestra akışı.', kaynak: 'A0 · karmaşıklık', etiket: ['durum'] },
  { deger: '~%50', metin: 'METR: 4 bakımcı 296 ajan PR\'ını inceledi; normalize edilince testi geçen PR\'ların kabaca yarısı birleştirilmezdi.', kaynak: 'A1 · akademik', etiket: ['oracle'] },
  { deger: '+%91', metin: 'Faros AI (10.000+ geliştirici): PR inceleme süresi +%91, ortalama PR boyutu +%154, birleşen PR +%98, geliştirici başına hata +%9.', kaynak: 'C6', etiket: ['insan'] },
  { deger: '17 / 24', metin: '32 hazır sistemden hiçbiri 12 gereksinimin hepsinde tam puan almıyor; en yüksek toplam GitLab Duo Agent Platform\'da.', kaynak: 'C1', etiket: ['durum', 'olcek'] },
  { deger: '111', metin: '9 iş akışı motorunda hata kaydı; en sık sınıf takılı ya da zombi çalışma (25 kayıt).', kaynak: 'D1', etiket: ['durum'] },
  { deger: '341', metin: 'ClawHub\'daki 2.857 skill\'den 341\'i zararlıydı; yayıncı için tek koşul bir haftalık GitHub hesabıydı.', kaynak: 'A3', etiket: ['skill', 'guvenlik'] },
  { deger: '$500', metin: 'Anthropic Start kademesinde aylık harcama tavanı; tavana ulaşınca istekler ay başına kadar 429 döner.', kaynak: 'C6', etiket: ['model'] },
];

export function Baslangic() {
  const { git } = useSayfa();
  const { durum } = useDurum();
  const { kanitAc } = useKanit();
  const kpi = [
    { ad: 'Kaynaklı bulgu', deger: KANITLAR.length, alt: 'araştırma dosyalarından' },
    { ad: 'Dünyada hata kaydı', deger: veri.d1.toplam + veri.d2.toplam + veri.d2.dikisler.length, alt: '9 motor + 8 ajan platformu' },
    { ad: 'Kestra pilot dersi', deger: veri.kestra.nedenler.length, alt: 'önceki pilotun kök nedenleri' },
    { ad: 'Risk bulgusu', deger: veri.risk.toplamBulgu, alt: `${veri.risk.derin} araç derin incelendi` },
    { ad: 'ECA kuralı', deger: KURALLAR.length, alt: 'aç, kapat, ayarla' },
    { ad: 'Hazır senaryo', deger: SENARYOLAR.length, alt: 'başlangıç noktası' },
  ];
  return (
    <Stack gap={36} className="sayfa">
      <SayfaBasligi ust="Fabrika Karar Merkezi" baslik="Kararların için bulgular"
        aciklama="Plane, agentic-rdd-development, GitHub CI/CD ve alpha.example.com akışını kurarken vereceğin kararlar ve her birinin dayandığı kaynaklı bulgular. Burada öneri yok; karar sende."
        sag={<>
          <Button leftSection={<IconAdjustmentsHorizontal size={16} />} onClick={() => git('tasarimci')}>Karar vermeye başla</Button>
          <Button variant="default" leftSection={<IconListSearch size={16} />} onClick={() => git('kanitlar')}>Bulgularda ara</Button>
        </>} />

      <SimpleGrid cols={{ base: 2, sm: 3, lg: 6 }} spacing="sm">
        {kpi.map((k) => (
          <Paper key={k.ad} withBorder p="md" className="kpi-karti">
            <Text size="xs" c="dimmed" fw={600}>{k.ad}</Text>
            <div className="kpi-deger">{sayi(k.deger)}</div>
            <Text size="xs" c="dimmed">{k.alt}</Text>
          </Paper>
        ))}
      </SimpleGrid>

      <Bolum baslik="Araştırmadan öne çıkan bulgular" aciklama="Her kart bir kaynaktaki ifadenin sayısal özü. Karta tıklayınca ilgili bütün kayıtlar açılır.">
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
          {ONE_CIKAN.map((b) => (
            <UnstyledButton key={b.deger + b.kaynak} className="bulgu-karti" onClick={() => kanitAc({ baslik: b.metin.slice(0, 70) + '…', alt: `Kaynak: ${b.kaynak}`, liste: kanitAra(b.etiket), olgular: [{ metin: b.metin, kaynak: b.kaynak }] })}>
              <div className="bulgu-deger">{b.deger}</div>
              <Text size="sm" mt={6}>{b.metin}</Text>
              <Group justify="space-between" mt="sm">
                <Badge size="sm" variant="light" color="gray">{b.kaynak}</Badge>
                <IconArrowRight size={16} className="bulgu-ok" />
              </Group>
            </UnstyledButton>
          ))}
        </SimpleGrid>
      </Bolum>

      <Bolum baslik="Vereceğin kararlar" aciklama="Her kararın seçenekleri, olguları ve karşılaştırma tablosu Senaryo tasarımcısında. Şu anki seçimler aşağıda."
        sag={<Button variant="subtle" rightSection={<IconArrowRight size={14} />} onClick={() => git('tasarimci?sekme=kararlar')}>Hepsini aç</Button>}>
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="sm">
          {KARARLAR.filter((k) => k.id !== 'gorunum').map((k) => {
            const v = durum.kararlar[k.id];
            const secim = Array.isArray(v) ? v.map((x) => secenekEtiket(k.id, x)).join(', ') : secenekEtiket(k.id, String(v));
            const n = kanitAra(k.kanit ?? []).length + k.secenekler.reduce((a, s) => a + (s.olgular?.length ?? 0), 0) + (k.olgular?.length ?? 0);
            return (
              <UnstyledButton key={k.id} className="karar-ozet" onClick={() => git(`tasarimci?sekme=kararlar&karar=${k.id}`)}>
                <Text size="xs" c="dimmed" fw={600}>{k.soru}</Text>
                <Text fw={650} mt={2}>{k.baslik}</Text>
                <Group justify="space-between" mt={8} wrap="nowrap">
                  <Text size="sm" c="indigo" lineClamp={1}>{secim || '—'}</Text>
                  <Badge size="sm" variant="light" color="gray">{sayi(n)} bulgu</Badge>
                </Group>
              </UnstyledButton>
            );
          })}
        </SimpleGrid>
      </Bolum>

      <Grid gutter="lg">
        <Grid.Col span={{ base: 12, md: 5 }}>
          <Paper withBorder p="lg" h="100%">
            <Title order={3} mb="md">Nasıl kullanılır</Title>
            <Stack gap="md">
              {[
                { ikon: IconTarget, ad: 'Senaryo seç', ne: 'Yedi hazır senaryodan biriyle başla; hepsi değiştirilebilir başlangıç noktası.' },
                { ikon: IconAdjustmentsHorizontal, ad: 'Bulgulara bakarak karar ver', ne: 'Her seçenekte olgular, risk puanı, dünya hata kaydı ve "Karşılaştır" tablosu var.' },
                { ikon: IconFileTypePdf, ad: 'PDF al', ne: 'Rapor; kararlarını, dayanak olgularını, diyagramları ve açık kuralları içerir.' },
              ].map((a, i) => (
                <Group key={a.ad} wrap="nowrap" align="flex-start">
                  <ThemeIcon variant="light" size={36} radius="md"><a.ikon size={19} /></ThemeIcon>
                  <div><Text fw={650}>{i + 1}. {a.ad}</Text><Text size="sm" c="dimmed">{a.ne}</Text></div>
                </Group>
              ))}
            </Stack>
          </Paper>
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 7 }}>
          <Paper withBorder p="lg" h="100%">
            <Title order={3} mb={4}>Senin pano yol haritan</Title>
            <Text size="sm" c="dimmed" mb="md">agentic-stack-docs (23.09) · geçiş eşikleri C6 §6'da "politika önerisi" olarak işaretli.</Text>
            <Timeline active={durum.hedefFaz} bulletSize={24} lineWidth={2}>
              <Timeline.Item bullet={<IconFlag size={13} />} title="Faz 0 · İskelet (2 hafta)">
                <Text size="sm" c="dimmed">policy.yaml; Plane webhook → orkestratör → tek görev tipi; başsız kodlama ajanı izole alanda; GitHub Actions kapıları.</Text>
              </Timeline.Item>
              <Timeline.Item title="Faz 1 · TDD sözleşmesi (3–4 hafta)">
                <Text size="sm" c="dimmed">RED kanıtı ve test kilidi; farklı sağlayıcıyla QA; risk sınıfı ve insan onayı; görev başına maliyet.</Text>
              </Timeline.Item>
              <Timeline.Item title="Faz 2 · Kalibrasyon (20–30 görev)">
                <Text size="sm" c="dimmed">Başarı, kaçan hata, süre, maliyet ölçümü; sınırların ölçüme göre ayarı; ilişki haritası; mutasyon testi.</Text>
              </Timeline.Item>
              <Timeline.Item title="Faz 3 · Ölçek ve öğrenme (sürekli)">
                <Text size="sm" c="dimmed">12.000 görevlik backlog normalizasyonu; skill önerileri → PR → eval; iz arşivi.</Text>
              </Timeline.Item>
            </Timeline>
          </Paper>
        </Grid.Col>
      </Grid>

      <Paper withBorder p="lg" className="kurulum-notu">
        <Group justify="space-between" wrap="wrap" gap="sm">
          <div>
            <Text fw={650}>Bu sayfa neyle kuruldu</Text>
            <List size="sm" spacing={2} mt={4}>
              <List.Item>Mantine 8 (React + TypeScript): radyo, onay kutusu, anahtar, arama, sekme, çekmece bileşenleri; açık/koyu tema.</List.Item>
              <List.Item>SCSS: tuval, yapışkan notlar, A4 rapor. Tailwind v4'ün resmî belgesi Sass ile kullanılmak için tasarlanmadığını söylüyor; DaisyUI onun eklentisi.</List.Item>
              <List.Item>ECharts istatistikler, Mermaid canlı diyagramlar, D2 kaynağı; Vite ile tek HTML dosyası.</List.Item>
            </List>
          </div>
          <Text size="xs" c="dimmed">Kaynak kod: fabrika-karar-merkezi/src · <Anchor size="xs" onClick={() => git('kaynaklar')}>kaynak dosyalar</Anchor></Text>
        </Group>
      </Paper>
    </Stack>
  );
}
