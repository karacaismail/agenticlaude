import { useMemo, useState } from 'react';
import { Accordion, Anchor, Badge, Chip, Group, Paper, Progress, SegmentedControl, Stack, Text, TextInput } from '@mantine/core';
import { SayfaBasligi } from '../bilesenler/SayfaBasligi';
import { IconAlertTriangle, IconMinus, IconSearch, IconShieldCheck } from '@tabler/icons-react';
import { SORUNLAR, KAYNAK_ADI, KAYNAK_DOSYA, KARARLA_ONLENEN, KURAL_GEREKMEZ } from '../veri/sorunlar';
import type { SorunKaynak } from '../veri/tipler';
import { useTuretilen } from '../durum/kanca';
import { KuralRozeti, useSayfa } from '../bilesenler/ortak';

const DURUM_ROZET = {
  kapsandi: { ad: 'Önlem açık', renk: 'teal', ikon: <IconShieldCheck size={12} /> },
  karar: { ad: 'Kararla önlendi', renk: 'teal', ikon: <IconShieldCheck size={12} /> },
  acik: { ad: 'Açık risk', renk: 'red', ikon: <IconAlertTriangle size={12} /> },
  gerekmez: { ad: 'Kural gerektirmez', renk: 'gray', ikon: <IconMinus size={12} /> },
};
const TUM_KAYNAKLAR = Object.keys(KAYNAK_ADI) as SorunKaynak[];

export function Sorunlar() {
  const t = useTuretilen();
  const { param, git } = useSayfa();
  const hedef = param.get('id');
  const kaynakParam = param.get('kaynak')?.split(',').filter((k) => (TUM_KAYNAKLAR as string[]).includes(k));
  const [kaynaklar, setKaynaklar] = useState<string[]>(kaynakParam?.length ? kaynakParam : hedef ? [SORUNLAR.find((s) => s.id === hedef)?.kaynak ?? 'kestra'] : [...TUM_KAYNAKLAR]);
  const [durumFiltre, setDurumFiltre] = useState(param.get('durum') ?? 'hepsi');
  const [ara, setAra] = useState(hedef ?? '');
  const liste = useMemo(() => {
    const q = ara.trim().toLocaleLowerCase('tr-TR');
    return SORUNLAR.filter((s) => {
      const du = t.kapsam.durumu(s.id);
      if (!kaynaklar.includes(s.kaynak)) return false;
      if (durumFiltre === 'acik' && du !== 'acik') return false;
      if (durumFiltre === 'onlenen' && !(du === 'kapsandi' || du === 'karar')) return false;
      return !q || `${s.id} ${s.baslik} ${s.ozet} ${s.ayrinti ?? ''}`.toLocaleLowerCase('tr-TR').includes(q);
    });
  }, [ara, kaynaklar, durumFiltre, t]);

  return (
    <Stack gap="lg" className="sayfa">
      <SayfaBasligi ust="Kanıt" baslik="Sorunlar ve önlemler" aciklama="Senin Kestra pilotunda yaşadıkların, dünyada orkestratör ve ajan platformlarında yaşananlar, öngörülen arızalar ve Codex incelemesi. Her sorunun yanında ona bağlı kurallar var: yeşil açık, kırmızı kapalı." />
      <Paper withBorder p="sm" radius="md">
        <Stack gap="xs">
          <Chip.Group multiple value={kaynaklar} onChange={setKaynaklar}>
            <Group gap={6}>
              {(Object.keys(KAYNAK_ADI) as SorunKaynak[]).map((k) => (
                <Chip key={k} value={k} size="xs" variant="light">{KAYNAK_ADI[k]} ({t.kapsam.kaynakBazli[k].kapsanan}/{t.kapsam.kaynakBazli[k].toplam})</Chip>
              ))}
            </Group>
          </Chip.Group>
          <Group gap="sm">
            <SegmentedControl size="xs" value={durumFiltre} onChange={setDurumFiltre} data={[{ label: 'Hepsi', value: 'hepsi' }, { label: 'Açık riskler', value: 'acik' }, { label: 'Önlenenler', value: 'onlenen' }]} />
            <TextInput size="xs" w={280} placeholder="Ara (ör. OOM, webhook, KP-15)" leftSection={<IconSearch size={14} />} value={ara} onChange={(e) => setAra(e.currentTarget.value)} />
            <Text size="xs" c="dimmed">{liste.length} sorun</Text>
          </Group>
        </Stack>
      </Paper>
      {TUM_KAYNAKLAR.filter((k) => liste.some((s) => s.kaynak === k)).map((k) => {
        const grup = liste.filter((s) => s.kaynak === k);
        const kb = t.kapsam.kaynakBazli[k];
        return (
          <section key={k} className="sorun-grubu">
            <div className="sorun-grubu-baslik">
              <Text fw={650}>{KAYNAK_ADI[k]}</Text>
              <Text size="xs" c="dimmed">{grup.length} sorun gösteriliyor · {kb.kapsanan}/{kb.toplam} önlemli</Text>
              <Progress className="sorun-grubu-cubuk" value={kb.toplam ? (100 * kb.kapsanan) / kb.toplam : 0} size={4} radius="xl" color="teal" aria-label={`${KAYNAK_ADI[k]} önlem kapsamı`} />
            </div>
            <Accordion variant="contained" radius="md" multiple defaultValue={hedef ? [hedef] : []} className="sorun-akordeon">
              {grup.map((s) => {
                const du = t.kapsam.durumu(s.id);
                const kurallar = t.kapsam.sorunKurallari.get(s.id) ?? [];
                const dr = DURUM_ROZET[du];
                return (
                  <Accordion.Item key={s.id} value={s.id}>
                    <Accordion.Control>
                      <Group justify="space-between" wrap="nowrap" gap="md" pr="xs">
                        <Group gap="sm" wrap="nowrap" style={{ minWidth: 0, flex: '1 1 auto' }}>
                          <span className="sorun-id">{s.id}</span>
                          <div style={{ minWidth: 0 }}>
                            <Text fw={600} size="sm" lineClamp={1}>{s.baslik}</Text>
                            <Text size="xs" c="dimmed" lineClamp={1}>{s.ozet}</Text>
                          </div>
                        </Group>
                        <Group gap={6} wrap="nowrap" style={{ flex: 'none' }}>
                          {s.kayitSayisi ? <Badge size="xs" variant="outline" color="gray" tt="none" visibleFrom="sm">{s.kayitSayisi} kayıt</Badge> : null}
                          <Badge color={dr.renk} variant="light" tt="none" leftSection={dr.ikon}>{dr.ad}</Badge>
                        </Group>
                      </Group>
                    </Accordion.Control>
                  <Accordion.Panel>
                    <Stack gap={6}>
                      <Text size="sm">{s.ozet}</Text>
                      {s.ayrinti && <Text size="sm" c="dimmed">{s.ayrinti}</Text>}
                      <Group gap={6}>
                        <Text size="xs" fw={600}>Önleyen kurallar:</Text>
                        {kurallar.map((kid) => <KuralRozeti key={kid} id={kid} aktif={t.aktif(kid)} onClick={() => git(`tasarimci?sekme=kurallar&kural=${kid}`)} />)}
                        {KARARLA_ONLENEN[s.id] && <Text size="xs">{KARARLA_ONLENEN[s.id].aciklama}</Text>}
                        {KURAL_GEREKMEZ[s.id] && <Text size="xs" c="dimmed">{KURAL_GEREKMEZ[s.id]}</Text>}
                      </Group>
                      {s.kayitlar && s.kayitlar.length > 0 && (
                        <Stack gap={4} mt={4}>
                          <Text size="xs" fw={600}>Kayıtlar</Text>
                          {s.kayitlar.slice(0, 12).map((r, i) => (
                            <Text key={i} size="xs">
                              • {r.url ? <Anchor href={r.url} target="_blank" rel="noreferrer" size="xs">{r.baslik}</Anchor> : r.baslik}
                              {r.alt && <Text span size="xs" c="dimmed"> · {r.alt}</Text>}
                            </Text>
                          ))}
                          {s.kayitlar.length > 12 && <Text size="xs" c="dimmed">…ve {s.kayitlar.length - 12} kayıt daha.</Text>}
                        </Stack>
                      )}
                      <Text size="xs" c="dimmed">Dosya: <Anchor href={`../${KAYNAK_DOSYA[s.kaynak]}`} target="_blank" size="xs">{KAYNAK_DOSYA[s.kaynak]}</Anchor></Text>
                    </Stack>
                  </Accordion.Panel>
                  </Accordion.Item>
                );
              })}
            </Accordion>
          </section>
        );
      })}
      {!liste.length && <Text c="dimmed" ta="center" py="xl">Bu süzgeçle sorun yok.</Text>}
    </Stack>
  );
}
