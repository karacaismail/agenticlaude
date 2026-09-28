import { ActionIcon, Alert, Autocomplete, Button, ColorSwatch, Group, Paper, SegmentedControl, Select, Stack, Table, Text, TextInput, Tooltip } from '@mantine/core';
import { IconPlus, IconTrash, IconInfoCircle } from '@tabler/icons-react';
import { useDurum } from '../durum/depo';
import { useTuretilen } from '../durum/kanca';
import { AKIS_SIRASI, asamaBul } from '../veri/asamalar';
import { KATEGORIK } from '../tema';
import veri from '../veri/uretilen.json';

const ONERILER = Array.from(new Set([
  ...veri.katalog.araclar.map((a) => a.ad),
  'GitHub Actions + merge queue', 'alpha.example.com', 'Temporal + Claude Code', 'Alan uzmanı + altın veri seti', 'Codex CLI + mutasyon + paralel koşum',
])).sort((a, b) => a.localeCompare(b, 'tr'));

export function KumePaneli() {
  const { durum, gonder } = useDurum();
  const t = useTuretilen();
  const gorunum = String(durum.kararlar.gorunum);
  return (
    <Stack gap="sm">
      <Text size="sm" c="dimmed">
        Küme: kendi teknolojisiyle çalışan bir akış parçası. Küme içindeki akış bitince oklar sıradaki kümeye geçer. Her senaryo küme kullanmak zorunda değil.
      </Text>
      <Group>
        <Text size="sm" fw={600}>Diyagram görünümü</Text>
        <SegmentedControl value={gorunum} onChange={(v) => gonder({ tur: 'karar', id: 'gorunum', deger: v })}
          data={[{ label: 'Teknoloji kümeleri', value: 'kume' }, { label: 'Dört ana bölüm', value: 'bolum' }, { label: 'Kümesiz', value: 'kumesiz' }]} />
      </Group>
      {gorunum === 'kume' && durum.kumeler.length === 0 && (
        <Alert icon={<IconInfoCircle size={16} />} color="blue">Bu senaryoda küme yok. "Küme ekle" ile başlayabilirsin; eklenen ilk küme bütün aşamaları alır.</Alert>
      )}
      {durum.kumeler.map((k, i) => (
        <Paper key={k.id} withBorder p="sm" radius="md" style={{ borderLeft: `5px solid ${k.renk}` }}>
          <Group justify="space-between" mb="xs">
            <Text fw={650}>Küme {i + 1}</Text>
            <Group gap={4}>
              {KATEGORIK.light.map((r) => (
                <ColorSwatch key={r} color={r} size={18} component="button" aria-label={`Renk ${r}`} onClick={() => gonder({ tur: 'kume', id: k.id, alan: 'renk', deger: r })}
                  style={{ outline: r === k.renk ? '2px solid var(--mantine-color-text)' : undefined, outlineOffset: 1, cursor: 'pointer' }} />
              ))}
              <Tooltip label="Kümeyi sil"><ActionIcon variant="subtle" color="red" onClick={() => gonder({ tur: 'kumeSil', id: k.id })} aria-label="Kümeyi sil"><IconTrash size={16} /></ActionIcon></Tooltip>
            </Group>
          </Group>
          <Group grow align="flex-start">
            <TextInput size="xs" label="Ad" value={k.ad} onChange={(e) => gonder({ tur: 'kume', id: k.id, alan: 'ad', deger: e.currentTarget.value })} />
            <Autocomplete size="xs" label="Teknoloji (listeden seç ya da yaz)" data={ONERILER} limit={12} value={k.teknoloji}
              onChange={(v) => gonder({ tur: 'kume', id: k.id, alan: 'teknoloji', deger: v })} />
            <TextInput size="xs" label="Devir olayı (sıradaki kümeye geçiş)" value={k.devir} placeholder="ör. PR açıldı" onChange={(e) => gonder({ tur: 'kume', id: k.id, alan: 'devir', deger: e.currentTarget.value })} />
          </Group>
        </Paper>
      ))}
      <Group>
        <Button size="xs" variant="light" leftSection={<IconPlus size={14} />} onClick={() => gonder({ tur: 'kumeEkle' })} disabled={durum.kumeler.length >= 8}>Küme ekle</Button>
        {durum.kumeler.length > 0 && gorunum !== 'kume' && (
          <Button size="xs" variant="subtle" onClick={() => gonder({ tur: 'karar', id: 'gorunum', deger: 'kume' })}>Diyagramda kümeleri göster</Button>
        )}
      </Group>
      {durum.kumeler.length > 0 && (
        <Paper withBorder p="sm" radius="md">
          <Text fw={650} mb="xs">Hangi aşama hangi kümede?</Text>
          <Table fz="sm" verticalSpacing={4}>
            <Table.Tbody>
              {AKIS_SIRASI.map((a) => {
                const as = asamaBul(a);
                return (
                  <Table.Tr key={a}>
                    <Table.Td w={70}><Text size="xs" c="dimmed">{as.kod}</Text></Table.Td>
                    <Table.Td>{as.ad}</Table.Td>
                    <Table.Td w={260}>
                      <Select size="xs" allowDeselect={false} value={t.kumeOf(a) ?? null}
                        data={durum.kumeler.map((k, i) => ({ value: k.id, label: `Küme ${i + 1} · ${k.teknoloji}` }))}
                        onChange={(v) => v && gonder({ tur: 'asamaKume', asama: a, kume: v })} aria-label={`${as.ad} kümesi`} />
                    </Table.Td>
                  </Table.Tr>
                );
              })}
            </Table.Tbody>
          </Table>
        </Paper>
      )}
    </Stack>
  );
}
