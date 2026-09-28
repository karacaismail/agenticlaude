import { useState } from 'react';
import { Accordion, Badge, Button, Chip, Code, CopyButton, Group, List, Paper, SimpleGrid, Stack, Text, Title } from '@mantine/core';
import { SayfaBasligi } from '../bilesenler/SayfaBasligi';
import { IconCheck, IconCopy, IconDownload } from '@tabler/icons-react';
import { BELGELER, BELGE_ILKELERI, ONCELIK_SIRASI } from '../veri/belgeler';
import { indir, useSayfa } from '../bilesenler/ortak';

const ZORUNLULUK_RENK: Record<string, string> = { 'Şimdi': 'red', 'Faz 1': 'yellow', 'Koşullu': 'gray', 'HRMS için şart': 'grape' };

export function Belgeler() {
  const { param } = useSayfa();
  const hedef = param.get('yol');
  const [filtre, setFiltre] = useState<string[]>(Object.keys(ZORUNLULUK_RENK));
  const liste = BELGELER.filter((b) => filtre.includes(b.zorunluluk));
  return (
    <Stack gap="lg" className="sayfa">
      <SayfaBasligi ust="Çıktı" baslik="Hazırlanacak dosyalar" aciklama="CLAUDE.md dışında hazırlanması gereken dosyalar: ne işe yaradıkları, kimin yazdığı, ne zaman okundukları ve doldurmaya hazır şablonları." />
      <SimpleGrid cols={{ base: 1, md: 2 }}>
        <Paper withBorder p="md" radius="md">
          <Title order={4} mb="xs">Kural nerede yaşarsa o kadar güçlüdür</Title>
          <Stack gap={6}>
            {ONCELIK_SIRASI.map((o, i) => (
              <Group key={o.ad} gap="sm" wrap="nowrap">
                <Badge size="lg" circle variant={i === 0 ? 'filled' : 'light'}>{i + 1}</Badge>
                <div><Text size="sm" fw={600}>{o.ad}</Text><Text size="xs" c="dimmed">{o.ornek}</Text></div>
              </Group>
            ))}
          </Stack>
          <Text size="xs" c="dimmed" mt="xs">Güvenlik yasağını yalnız .md'ye bırakma. Kaynak: A3</Text>
        </Paper>
        <Paper withBorder p="md" radius="md">
          <Title order={4} mb="xs">Yazarken</Title>
          <List size="sm" spacing={4}>{BELGE_ILKELERI.map((i) => <List.Item key={i}>{i}</List.Item>)}</List>
        </Paper>
      </SimpleGrid>
      <Chip.Group multiple value={filtre} onChange={setFiltre}>
        <Group gap={6}>{Object.entries(ZORUNLULUK_RENK).map(([z, r]) => <Chip key={z} value={z} size="xs" color={r}>{z} ({BELGELER.filter((b) => b.zorunluluk === z).length})</Chip>)}</Group>
      </Chip.Group>
      <Accordion variant="separated" radius="md" multiple defaultValue={hedef ? [hedef] : [BELGELER[0].yol]}>
        {liste.map((b) => (
          <Accordion.Item key={b.yol} value={b.yol}>
            <Accordion.Control>
              <Group justify="space-between" wrap="nowrap" pr="sm">
                <div>
                  <Code fz="sm">{b.yol}</Code>
                  <Text size="sm" fw={600} mt={2}>{b.ad}</Text>
                </div>
                <Badge variant="light" color={ZORUNLULUK_RENK[b.zorunluluk]}>{b.zorunluluk}</Badge>
              </Group>
            </Accordion.Control>
            <Accordion.Panel>
              <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="xs" mb="sm">
                <Text size="sm"><b>Ne işe yarar:</b> {b.neIse}</Text>
                <Text size="sm"><b>Kim yazar:</b> {b.kimYazar}</Text>
                <Text size="sm"><b>Ne zaman okunur:</b> {b.neZaman}</Text>
                <Text size="sm"><b>Boyut:</b> {b.boyut}</Text>
              </SimpleGrid>
              {b.ipucu && <Text size="sm" c="indigo.7" mb="xs">💡 {b.ipucu}</Text>}
              <Group justify="space-between" mb={6}>
                <Text size="xs" c="dimmed">Kaynak: {b.kaynak.join(' · ')}</Text>
                <Group gap="xs">
                  <CopyButton value={b.sablon}>{({ copied, copy }) => <Button size="compact-xs" variant="light" leftSection={copied ? <IconCheck size={12} /> : <IconCopy size={12} />} onClick={copy}>{copied ? 'Kopyalandı' : 'Kopyala'}</Button>}</CopyButton>
                  <Button size="compact-xs" variant="light" leftSection={<IconDownload size={12} />} onClick={() => indir(b.yol.split('/').pop()!.replace(/[<>]/g, ''), b.sablon)}>İndir</Button>
                </Group>
              </Group>
              <Code block className="kod-blok">{b.sablon}</Code>
            </Accordion.Panel>
          </Accordion.Item>
        ))}
      </Accordion>
    </Stack>
  );
}
