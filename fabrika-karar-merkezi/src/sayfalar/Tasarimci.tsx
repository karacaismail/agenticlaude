import { useEffect, useMemo, useState } from 'react';
import { Alert, Badge, Button, FileButton, Grid, Group, Paper, Progress, RingProgress, SegmentedControl, SimpleGrid, Stack, Tabs, Text, Title, Tooltip } from '@mantine/core';
import { IconArrowBackUp, IconDownload, IconFileTypePdf, IconRefresh, IconSitemap, IconUpload } from '@tabler/icons-react';
import { SENARYOLAR } from '../veri/senaryolar';
import { KAYNAK_ADI } from '../veri/sorunlar';
import { useDurum, durumGecerliMi, type Durum } from '../durum/depo';
import { useTuretilen } from '../durum/kanca';
import { genelDiyagram } from '../diyagram/uretec';
import { MermaidGorunum } from '../diyagram/MermaidGorunum';
import { KararPaneli } from '../bilesenler/KararPaneli';
import { KuralPaneli } from '../bilesenler/KuralPaneli';
import { KumePaneli } from '../bilesenler/KumePaneli';
import { UyariListesi } from '../bilesenler/UyariListesi';
import { indir, useSayfa } from '../bilesenler/ortak';
import { SayfaBasligi } from '../bilesenler/SayfaBasligi';
import type { Faz, SorunKaynak } from '../veri/tipler';

function CanliOzet() {
  const { durum } = useDurum();
  const t = useTuretilen();
  const { git } = useSayfa();
  const oran = Math.round((t.kapsam.kapsanan / Math.max(1, t.kapsam.toplam)) * 100);
  const genel = useMemo(() => genelDiyagram(durum, t), [durum, t]);
  const kritik = t.uyarilar.filter((u) => u.seviye === 'kritik').length;
  return (
    <Stack gap="sm" style={{ position: 'sticky', top: 74 }}>
      <Paper withBorder p="md" radius="md">
        <Group wrap="nowrap" align="center">
          <RingProgress size={96} thickness={10} roundCaps sections={[{ value: oran, color: oran >= 80 ? 'teal' : oran >= 50 ? 'yellow' : 'red' }]}
            label={<Text ta="center" fw={700} size="lg">%{oran}</Text>} />
          <div>
            <Text fw={650}>Sorun kapsamı</Text>
            <Text size="sm" c="dimmed">Kataloglanan {t.kapsam.toplam} sorunun {t.kapsam.kapsanan}'i açık bir kurala ya da karara bağlı.</Text>
            <Button size="compact-xs" variant="subtle" px={0} onClick={() => git('sorunlar?durum=acik')}>{t.kapsam.acikSorunlar.length} açık riski gör</Button>
          </div>
        </Group>
        <Stack gap={4} mt="sm">
          {(Object.keys(KAYNAK_ADI) as SorunKaynak[]).map((k) => {
            const s = t.kapsam.kaynakBazli[k];
            const y = Math.round((s.kapsanan / Math.max(1, s.toplam)) * 100);
            return (
              <div key={k}>
                <Group justify="space-between"><Text size="xs">{KAYNAK_ADI[k]}</Text><Text size="xs" c="dimmed" className="sayisal">{s.kapsanan}/{s.toplam}</Text></Group>
                <Progress value={y} size="xs" color={y >= 80 ? 'teal' : y >= 50 ? 'yellow' : 'red'} aria-label={KAYNAK_ADI[k]} />
              </div>
            );
          })}
        </Stack>
      </Paper>
      <Paper withBorder p="md" radius="md">
        <Group justify="space-between" mb="xs">
          <Text fw={650}>Dikkat çeken bulgular</Text>
          <Group gap={4}>{kritik > 0 && <Badge color="red">{kritik} kritik</Badge>}<Badge variant="light">{t.uyarilar.length}</Badge></Group>
        </Group>
        <UyariListesi uyarilar={t.uyarilar} enFazla={4} />
        {t.uyarilar.length > 4 && <Button size="compact-xs" variant="subtle" mt={6} onClick={() => git('tasarimci?sekme=uyarilar')}>Tümünü gör</Button>}
      </Paper>
      <Paper withBorder p="sm" radius="md">
        <Group justify="space-between" mb="xs">
          <Text fw={650}>{genel.baslik}</Text>
          <Button size="compact-xs" variant="light" leftSection={<IconSitemap size={14} />} onClick={() => git('diyagramlar')}>Bütün diyagramlar</Button>
        </Group>
        <MermaidGorunum kod={genel.kod} />
      </Paper>
    </Stack>
  );
}

export function Tasarimci() {
  const { durum, gonder } = useDurum();
  const t = useTuretilen();
  const { param, git } = useSayfa();
  const sekme = param.get('sekme') ?? 'kararlar';
  const hedefKural = param.get('kural');
  const hedefKarar = param.get('karar');
  useEffect(() => {
    if (!hedefKarar) return;
    const z = setTimeout(() => document.getElementById(`karar-${hedefKarar}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 250);
    return () => clearTimeout(z);
  }, [hedefKarar]);
  const [onceki, setOnceki] = useState<Durum | null>(null);
  const [yuklemeHatasi, setYuklemeHatasi] = useState<string | null>(null);

  const senaryoSec = (id: string) => {
    if (id === durum.senaryoId) return;
    if (t.degisenKararlar.length + t.degisenKurallar.length > 0) setOnceki(durum); else setOnceki(null);
    gonder({ tur: 'senaryo', id });
  };
  const jsonIndir = () => indir(`fabrika-kararlari-${durum.senaryoId}.json`, JSON.stringify(durum, null, 2), 'application/json');
  const jsonYukle = async (f: File | null) => {
    if (!f) return;
    try {
      const d = JSON.parse(await f.text());
      if (!durumGecerliMi(d)) throw new Error('Dosya bu merkezin karar dosyası değil.');
      gonder({ tur: 'yukle', durum: d });
      setYuklemeHatasi(null);
    } catch (e) { setYuklemeHatasi(e instanceof Error ? e.message : String(e)); }
  };

  return (
    <Stack gap="md">
      <SayfaBasligi ust="Karar" baslik="Senaryo tasarımcısı"
        aciklama="Hazır bir senaryodan başla; kararları ve ECA kurallarını değiştir. Her seçenekte kaynaklı olgular var; öneri yok. Değişikliklerin bu tarayıcıda saklanır."
        sag={<>
          <FileButton onChange={jsonYukle} accept="application/json">{(p) => <Button {...p} size="xs" variant="default" leftSection={<IconUpload size={14} />}>Karar dosyası yükle</Button>}</FileButton>
          <Button size="xs" variant="default" leftSection={<IconDownload size={14} />} onClick={jsonIndir}>Kararları indir</Button>
          <Tooltip label="Bu senaryonun hazır ayarlarına dön">
            <Button size="xs" variant="default" leftSection={<IconRefresh size={14} />} onClick={() => { setOnceki(durum); gonder({ tur: 'sifirla' }); }}>Sıfırla</Button>
          </Tooltip>
          <Button size="xs" leftSection={<IconFileTypePdf size={14} />} onClick={() => git('rapor?yazdir=1')}>PDF</Button>
        </>} />

      {onceki && (
        <Alert color="indigo" variant="light" withCloseButton onClose={() => setOnceki(null)} title="Ayarlar değişti">
          <Group justify="space-between">
            <Text size="sm">Önceki ayarların saklandı.</Text>
            <Button size="xs" variant="light" leftSection={<IconArrowBackUp size={14} />} onClick={() => { gonder({ tur: 'yukle', durum: onceki }); setOnceki(null); }}>Önceki ayarlara dön</Button>
          </Group>
        </Alert>
      )}
      {yuklemeHatasi && <Alert color="red" withCloseButton onClose={() => setYuklemeHatasi(null)}>{yuklemeHatasi}</Alert>}

      <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="sm">
        {SENARYOLAR.map((s) => (
          <Paper key={s.id} withBorder p="sm" radius="md" className={`senaryo-karti${s.id === durum.senaryoId ? ' secili' : ''}`}
            onClick={() => senaryoSec(s.id)} role="button" tabIndex={0} aria-pressed={s.id === durum.senaryoId}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); senaryoSec(s.id); } }}>
            <Group justify="space-between" wrap="nowrap" mb={4}>
              <Badge size="sm" variant={s.id === durum.senaryoId ? 'filled' : 'light'}>{s.kisa}</Badge>
              <Badge size="xs" variant="outline" color="gray">Faz {s.hedefFaz}{s.kumeler ? ` · ${s.kumeler.length} küme` : ''}</Badge>
            </Group>
            <Text fw={650} size="sm">{s.ad}</Text>
            <Text size="xs" c="dimmed" lineClamp={3}>{s.ozet}</Text>
          </Paper>
        ))}
      </SimpleGrid>

      <Paper withBorder p="lg" className="senaryo-bilgi">
        <Grid gutter="lg">
          <Grid.Col span={{ base: 12, md: 8 }}>
            <Text size="xs" fw={700} c="dimmed" tt="uppercase" style={{ letterSpacing: '0.05em' }}>Seçili senaryo</Text>
            <Title order={3} mt={2}>{t.senaryo.ad}</Title>
            <Text size="sm" mt={4}>{t.senaryo.ozet}</Text>
            <Text size="sm" c="dimmed" mt={4}>{t.senaryo.neZaman}</Text>
            {!!t.senaryo.bulgular.length && (
              <>
                <Text size="xs" fw={700} c="dimmed" tt="uppercase" mt="md" mb={4} style={{ letterSpacing: '0.05em' }}>Bu senaryonun dayandığı bulgular</Text>
                <ul className="olgu-listesi">{t.senaryo.bulgular.map((b) => <li key={b}><Text size="sm" span>{b}</Text></li>)}</ul>
              </>
            )}
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 4 }}>
            <Stack gap="xs" className="faz-kutusu">
              <Text size="sm" fw={650}>Hedef faz</Text>
              <SegmentedControl fullWidth size="xs" value={String(durum.hedefFaz)} onChange={(v) => gonder({ tur: 'faz', faz: Number(v) as Faz })}
                data={[{ label: 'Faz 0', value: '0' }, { label: 'Faz 1', value: '1' }, { label: 'Faz 2', value: '2' }, { label: 'Faz 3', value: '3' }]} />
              <Text size="xs" c="dimmed">Faz değişince kurallar o fazın listesine göre açılır ya da kapanır. Fazlar senin pano yol haritandan: 0 iskelet, 1 TDD sözleşmesi, 2 kalibrasyon, 3 ölçek.</Text>
              <Group gap={6}>
                <Badge variant="light">{t.aktifKurallar.length} kural açık</Badge>
                <Badge variant="light" color="gray">{durum.kumeler.length} küme</Badge>
                {t.degisenKararlar.length + t.degisenKurallar.length > 0 && <Badge variant="light" color="grape">{t.degisenKararlar.length + t.degisenKurallar.length} değişiklik</Badge>}
              </Group>
            </Stack>
          </Grid.Col>
        </Grid>
      </Paper>

      <Grid gutter="md">
        <Grid.Col span={{ base: 12, lg: 7 }}>
          <Tabs value={sekme} onChange={(v) => git(`tasarimci?sekme=${v}`)} keepMounted={false}>
            <Tabs.List mb="sm">
              <Tabs.Tab value="kararlar">Kararlar{t.degisenKararlar.length ? ` (${t.degisenKararlar.length})` : ''}</Tabs.Tab>
              <Tabs.Tab value="kurallar">ECA kuralları ({t.aktifKurallar.length})</Tabs.Tab>
              <Tabs.Tab value="kumeler">Kümeler ({durum.kumeler.length})</Tabs.Tab>
              <Tabs.Tab value="uyarilar">Dikkat ({t.uyarilar.length})</Tabs.Tab>
            </Tabs.List>
            <Tabs.Panel value="kararlar"><KararPaneli /></Tabs.Panel>
            <Tabs.Panel value="kurallar"><KuralPaneli hedef={hedefKural} /></Tabs.Panel>
            <Tabs.Panel value="kumeler"><KumePaneli /></Tabs.Panel>
            <Tabs.Panel value="uyarilar"><UyariListesi uyarilar={t.uyarilar} /></Tabs.Panel>
          </Tabs>
        </Grid.Col>
        <Grid.Col span={{ base: 12, lg: 5 }}>
          <CanliOzet />
        </Grid.Col>
      </Grid>
    </Stack>
  );
}
