import { Anchor, Badge, Group, Paper, Stack, Table, Text, Title } from '@mantine/core';
import { SayfaBasligi } from '../bilesenler/SayfaBasligi';
import { KAYNAKLAR } from '../veri/kaynaklar';

export function Kaynaklar() {
  const gruplar = Array.from(new Set(KAYNAKLAR.map((k) => k.grup)));
  return (
    <Stack gap="lg" className="sayfa">
      <SayfaBasligi ust="Kaynak" baslik="Kaynak dosyalar" aciklama="Bu merkezdeki her kural, bulgu ve sayı bu dosyalardan gelir. Bağlantılar bu HTML dosyasının bulunduğu klasöre göredir. Codex klasörü yalnız okundu." />
      {gruplar.map((g) => (
        <Paper key={g} withBorder p="md" radius="md">
          <Title order={4} mb="xs">{g}</Title>
          <Table fz="sm" verticalSpacing={6}>
            <Table.Tbody>
              {KAYNAKLAR.filter((k) => k.grup === g).map((k) => (
                <Table.Tr key={k.kod + k.ad}>
                  <Table.Td w={96}><Badge variant="light" tt="none">{k.kod}</Badge></Table.Td>
                  <Table.Td><Anchor href={k.yol} target="_blank" rel="noreferrer">{k.ad}</Anchor><Text size="xs" c="dimmed">{k.ne}</Text></Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Paper>
      ))}
      <Group><Text size="xs" c="dimmed">Veri dosyası araştırma dosyalarından üretildi: fabrika-karar-merkezi/scripts/veri-uret.mjs</Text></Group>
    </Stack>
  );
}
