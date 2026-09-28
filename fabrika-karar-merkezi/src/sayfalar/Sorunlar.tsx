import { useMemo, useState } from 'react';
import { Accordion, Anchor, Badge, Chip, Group, Paper, SegmentedControl, Stack, Text, TextInput } from '@mantine/core';
import { SayfaBasligi } from '../bilesenler/SayfaBasligi';
import { IconSearch } from '@tabler/icons-react';
import { SORUNLAR, KAYNAK_ADI, KAYNAK_DOSYA, KARARLA_ONLENEN, KURAL_GEREKMEZ } from '../veri/sorunlar';
import type { SorunKaynak } from '../veri/tipler';
import { useTuretilen } from '../durum/kanca';
import { KuralRozeti, useSayfa } from '../bilesenler/ortak';

const DURUM_ROZET = {
  kapsandi: { ad: 'Önlem açık', renk: 'teal' },
  karar: { ad: 'Kararla önlendi', renk: 'teal' },
  acik: { ad: 'Açık risk', renk: 'red' },
  gerekmez: { ad: 'Kural gerektirmez', renk: 'gray' },
};

export function Sorunlar() {
  const t = useTuretilen();
  const { param, git } = useSayfa();
  const hedef = param.get('id');
  const [kaynaklar, setKaynaklar] = useState<string[]>(hedef ? [SORUNLAR.find((s) => s.id === hedef)?.kaynak ?? 'kestra'] : ['kestra', 'd1', 'd2', 'd2d', 'b2', 'b3', 'codex']);
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
                <Chip key={k} value={k} size="xs">{KAYNAK_ADI[k]} ({t.kapsam.kaynakBazli[k].kapsanan}/{t.kapsam.kaynakBazli[k].toplam})</Chip>
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
      <Accordion variant="separated" radius="md" multiple defaultValue={hedef ? [hedef] : []}>
        {liste.map((s) => {
          const du = t.kapsam.durumu(s.id);
          const kurallar = t.kapsam.sorunKurallari.get(s.id) ?? [];
          const dr = DURUM_ROZET[du];
          return (
            <Accordion.Item key={s.id} value={s.id}>
              <Accordion.Control>
                <Group justify="space-between" wrap="nowrap" pr="sm">
                  <div>
                    <Group gap={6} mb={2}>
                      <Badge variant="default" radius="sm" tt="none">{s.id}</Badge>
                      <Badge size="xs" variant="light" color="gray" tt="none">{KAYNAK_ADI[s.kaynak]}</Badge>
                      {s.kayitSayisi ? <Badge size="xs" variant="outline" color="gray" tt="none">{s.kayitSayisi} kayıt</Badge> : null}
                    </Group>
                    <Text fw={600} size="sm">{s.baslik}</Text>
                  </div>
                  <Badge color={dr.renk} variant="light">{dr.ad}</Badge>
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
    </Stack>
  );
}
