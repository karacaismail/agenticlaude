import { useState, type ReactNode } from 'react';
import { Group, Paper, SegmentedControl, Stack, Table, Text, Title } from '@mantine/core';
import type { EChartsOption } from 'echarts';
import { EGrafik } from '../grafik/EGrafik';

export interface TabloVerisi { basliklar: string[]; satirlar: (string | number)[][] }

// Her grafiğin tablo görünümü vardır: renk tek başına bilgi taşımaz, değerler tabloda okunur.
export function GrafikKarti({ baslik, aciklama, kaynak, secenek, tablo, yukseklik = 320, ek }: {
  baslik: string; aciklama?: string; kaynak?: string; secenek: EChartsOption; tablo: TabloVerisi; yukseklik?: number; ek?: ReactNode;
}) {
  const [gorunum, setGorunum] = useState<'grafik' | 'tablo'>('grafik');
  return (
    <Paper withBorder p="md" radius="md" className="grafik-karti">
      <Stack gap="xs">
        <Group justify="space-between" align="flex-start" wrap="wrap" gap="xs">
          <div style={{ flex: '1 1 220px', minWidth: 0 }}>
            <Title order={4}>{baslik}</Title>
            {aciklama && <Text size="sm" c="dimmed">{aciklama}</Text>}
          </div>
          <SegmentedControl size="xs" value={gorunum} onChange={(v) => setGorunum(v as 'grafik' | 'tablo')} data={[{ label: 'Grafik', value: 'grafik' }, { label: 'Tablo', value: 'tablo' }]} />
        </Group>
        {ek}
        {gorunum === 'grafik' ? (
          <EGrafik secenek={secenek} yukseklik={yukseklik} etiket={baslik} />
        ) : (
          <Table.ScrollContainer minWidth={420} mah={yukseklik + 40}>
            <Table striped withTableBorder fz="sm" className="sayisal-tablo">
              <Table.Thead><Table.Tr>{tablo.basliklar.map((b) => <Table.Th key={b}>{b}</Table.Th>)}</Table.Tr></Table.Thead>
              <Table.Tbody>{tablo.satirlar.map((s, i) => <Table.Tr key={i}>{s.map((h, j) => <Table.Td key={j}>{h}</Table.Td>)}</Table.Tr>)}</Table.Tbody>
            </Table>
          </Table.ScrollContainer>
        )}
        {kaynak && <Text size="xs" c="dimmed">Kaynak: {kaynak}</Text>}
      </Stack>
    </Paper>
  );
}
