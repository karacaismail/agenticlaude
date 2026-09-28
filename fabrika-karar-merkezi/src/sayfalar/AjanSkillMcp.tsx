import { useMemo } from 'react';
import { Badge, Button, Group, List, Paper, SimpleGrid, Stack, Table, Tabs, Text, Title, Alert } from '@mantine/core';
import { IconInfoCircle, IconListDetails } from '@tabler/icons-react';
import { CODEX_ROLLERI, HAVUZ_OLGULARI, MCP_EKLENMEYECEK, MCP_KURUM_MODELI, MCP_SUNUCULARI, SKILL_CERCEVELERI, SKILLER, TERMINAL_SONUCLAR } from '../veri/ajanlar';
import { KANITLAR, kanitAra } from '../veri/kanit';
import { KanitOgesi, useKanit } from '../bilesenler/Kanit';
import { SayfaBasligi } from '../bilesenler/SayfaBasligi';
import { asamaBul } from '../veri/asamalar';
import { havuzDiyagrami } from '../diyagram/uretec';
import { MermaidGorunum } from '../diyagram/MermaidGorunum';
import veri from '../veri/uretilen.json';

const KARAR_RENK: Record<string, string> = { 'Kalsın': 'teal', 'Ayarla': 'yellow', 'Ajan değil': 'blue' };

export function AjanSkillMcp() {
  const havuz = useMemo(() => havuzDiyagrami(), []);
  const { kanitAc } = useKanit();
  const a3 = (bolum: string) => KANITLAR.filter((k) => k.kod === 'A3' && k.baslik.startsWith(bolum));
  const kanitDugmesi = (baslik: string, etiketler: string[]) => {
    const l = kanitAra(etiketler);
    return <Button size="xs" variant="light" leftSection={<IconListDetails size={14} />} onClick={() => kanitAc({ baslik, liste: l })}>{baslik} ({l.length})</Button>;
  };
  return (
    <Stack gap="lg" className="sayfa">
      <SayfaBasligi ust="Kanıt" baslik="Ajanlar, skill'ler ve MCP"
        aciklama="Ajan rolleri, skill'ler, skill'lerin nereden beslendiği ve MCP sunucularının yetkileri hakkında kaynaklardaki bulgular."
        sag={<>{kanitDugmesi('Skill bulguları', ['skill'])}{kanitDugmesi('MCP bulguları', ['mcp'])}</>} />
      <Tabs defaultValue="ajanlar" keepMounted={false}>
        <Tabs.List mb="sm">
          <Tabs.Tab value="ajanlar">Ajanlar</Tabs.Tab>
          <Tabs.Tab value="skill">Skill'ler</Tabs.Tab>
          <Tabs.Tab value="havuz">Skill havuzu (besleme)</Tabs.Tab>
          <Tabs.Tab value="mcp">MCP</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="ajanlar">
          <Stack gap="md">
            <Paper withBorder p="md" radius="md">
              <Group justify="space-between" mb="xs"><Title order={4}>Alt ajanlara dair bulgular (A3)</Title>{kanitDugmesi('Bağımsız doğrulama bulguları', ['dogrulayici'])}</Group>
              <Stack gap="xs">{a3('alt ajanlar').map((k) => <KanitOgesi key={k.id} k={k} />)}</Stack>
            </Paper>
            <Paper withBorder p="md" radius="md">
              <Title order={4} mb={4}>Panondaki 21 ajan</Title>
              <Text size="sm" c="dimmed" mb="sm">Kaynak: senin ajan–sağlayıcı panon. Son iki sütun 23.09 raporunun değerlendirmesidir; bulgu değildir.</Text>
              <Table.ScrollContainer minWidth={820}>
                <Table fz="xs" striped verticalSpacing={6}>
                  <Table.Thead><Table.Tr><Table.Th>Ajan</Table.Th><Table.Th>Panodaki seçim</Table.Th><Table.Th>23.09 kararı</Table.Th><Table.Th>23.09 notu</Table.Th></Table.Tr></Table.Thead>
                  <Table.Tbody>
                    {veri.panoAjanlari.map((a) => (
                      <Table.Tr key={a.ajan}>
                        <Table.Td fw={600}>{a.ajan}</Table.Td>
                        <Table.Td>{a.panoSecimi}</Table.Td>
                        <Table.Td><Badge size="xs" variant="light" color={KARAR_RENK[a.karar] ?? 'gray'}>{a.karar}</Badge></Table.Td>
                        <Table.Td>{a.oneri}</Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              </Table.ScrollContainer>
            </Paper>
            <SimpleGrid cols={{ base: 1, md: 2 }}>
              <Paper withBorder p="md" radius="md">
                <Title order={4} mb={4}>Codex'in 12 rol şablonu (referans)</Title>
                <Text size="xs" c="dimmed" mb="xs">Pasif şablonlar; kurulmuş değil. Evre: ilk koşuda gerekip gerekmediği.</Text>
                <Table fz="xs" verticalSpacing={4}>
                  <Table.Tbody>{CODEX_ROLLERI.map((r) => <Table.Tr key={r.id}><Table.Td w={54}>{r.id}</Table.Td><Table.Td>{r.ad}</Table.Td><Table.Td><Badge size="xs" variant="outline" color={r.evre === 'MVP' ? 'teal' : 'gray'}>{r.evre}</Badge></Table.Td></Table.Tr>)}</Table.Tbody>
                </Table>
              </Paper>
              <Paper withBorder p="md" radius="md">
                <Title order={4} mb={4}>Her ajanın döndürebileceği 6 sonuç</Title>
                <Text size="xs" c="dimmed" mb="xs">Ajan "bitti" demez; bu altı sonuçtan birini döndürür (Codex tasarımı, E4).</Text>
                <Table fz="xs" verticalSpacing={4}>
                  <Table.Tbody>{TERMINAL_SONUCLAR.map((s) => <Table.Tr key={s.ad}><Table.Td><code>{s.ad}</code></Table.Td><Table.Td>{s.ne}</Table.Td></Table.Tr>)}</Table.Tbody>
                </Table>
              </Paper>
            </SimpleGrid>
          </Stack>
        </Tabs.Panel>

        <Tabs.Panel value="skill">
          <Stack gap="md">
            <Alert icon={<IconInfoCircle size={16} />} color="blue" variant="light" title="A3 ölçümü">
              Skill sayısı arttıkça seçim bozuluyor: 20 skill'e kadar doğruluk %90'ın üstünde, yaklaşık 30'dan sonra düşüyor, 200 skill'de yaklaşık %20 (GPT-4o ölçümü). Özenle yazılmış skill'ler başarıyı +16,6 puan artırdı; modelin kendi ürettiği skill'ler ortalamada fayda sağlamadı (SkillsBench).
            </Alert>
            <Paper withBorder p="md" radius="md">
              <Title order={4} mb={4}>Aday skill listesi</Title>
              <Text size="sm" c="dimmed" mb="xs">A3'te geçen skill türleri ve Codex'in şablon adlarından derlendi; aşamaya göre.</Text>
              <Table.ScrollContainer minWidth={720}>
                <Table fz="xs" striped verticalSpacing={6}>
                  <Table.Thead><Table.Tr><Table.Th>Skill</Table.Th><Table.Th>Aşama</Table.Th><Table.Th>Ne yapar</Table.Th><Table.Th>Kaynak</Table.Th></Table.Tr></Table.Thead>
                  <Table.Tbody>
                    {SKILLER.map((s) => (
                      <Table.Tr key={s.id}>
                        <Table.Td><code>{s.id}</code><Text size="xs" c="dimmed">{s.ad}</Text></Table.Td>
                        <Table.Td>{asamaBul(s.asama).ad}</Table.Td>
                        <Table.Td>{s.ne}</Table.Td>
                        <Table.Td>{s.kaynak}</Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              </Table.ScrollContainer>
            </Paper>
            <Paper withBorder p="md" radius="md">
              <Title order={4} mb="xs">Skill'lere dair bulgular (A3)</Title>
              <Stack gap="xs">{a3('skills').map((k) => <KanitOgesi key={k.id} k={k} />)}</Stack>
            </Paper>
            <Title order={4}>Skill oluşturma çerçeveleri</Title>
            <SimpleGrid cols={{ base: 1, md: 2, lg: 3 }}>
              {SKILL_CERCEVELERI.map((c) => (
                <Paper key={c.ad} withBorder p="md" radius="md">
                  <Text fw={650} mb={4}>{c.ad}</Text>
                  <Text size="sm">{c.ne}</Text>
                  <Text size="sm" mt={6}><b>Nasıl kullanılır:</b> {c.nasil}</Text>
                  <Text size="xs" c="dimmed" mt={6}>Kaynak: {c.kaynak}</Text>
                </Paper>
              ))}
            </SimpleGrid>
          </Stack>
        </Tabs.Panel>

        <Tabs.Panel value="havuz">
          <Stack gap="md">
            <Text size="sm">A3 ve Codex'in havuz modeli: pazar ve kayıtlar keşif kaynağı; aday karantina, inceleme, sözleşme testi ve bağımsız eval'den geçip iç kataloğa sabit sürümle girer; işe kısa ömürlü izinle açılır. Aşağıdaki olgular bu modelin dayandığı olaylar.</Text>
            <Paper withBorder p="md" radius="md"><MermaidGorunum kod={havuz.kod} /></Paper>
            <SimpleGrid cols={{ base: 1, md: 2 }}>
              {HAVUZ_OLGULARI.map((o) => (
                <Paper key={o.metin} withBorder p="sm" radius="md">
                  <Text size="sm">{o.metin}</Text>
                  <Text size="xs" c="dimmed" mt={4}>Kaynak: {o.kaynak}</Text>
                </Paper>
              ))}
            </SimpleGrid>
          </Stack>
        </Tabs.Panel>

        <Tabs.Panel value="mcp">
          <Stack gap="md">
            <Paper withBorder p="md" radius="md">
              <Title order={4} mb="xs">Kaynaklarda anılan sunucular ve yetki notları</Title>
              <Table.ScrollContainer minWidth={760}>
                <Table fz="xs" striped verticalSpacing={6}>
                  <Table.Thead><Table.Tr><Table.Th>Sunucu</Table.Th><Table.Th>Aşamalar</Table.Th><Table.Th>Kullanım</Table.Th><Table.Th>Yetki</Table.Th><Table.Th>Not</Table.Th></Table.Tr></Table.Thead>
                  <Table.Tbody>
                    {MCP_SUNUCULARI.map((m) => (
                      <Table.Tr key={m.ad}>
                        <Table.Td fw={600}>{m.ad}</Table.Td>
                        <Table.Td>{m.asamalar.map((a) => asamaBul(a).ad).join(', ')}</Table.Td>
                        <Table.Td>{m.kullanim}</Table.Td>
                        <Table.Td>{m.yetki}</Table.Td>
                        <Table.Td>{m.not} <Text span size="xs" c="dimmed">({m.kaynak})</Text></Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              </Table.ScrollContainer>
            </Paper>
            <Paper withBorder p="md" radius="md">
              <Title order={4} mb="xs">MCP'ye dair bulgular ve olaylar (A3)</Title>
              <Stack gap="xs">{a3('mcp').map((k) => <KanitOgesi key={k.id} k={k} />)}</Stack>
            </Paper>
            <SimpleGrid cols={{ base: 1, md: 2 }}>
              <Paper withBorder p="md" radius="md">
                <Title order={4} mb="xs">A3'te riskli bulunan türler</Title>
                <List size="sm" spacing={4}>{MCP_EKLENMEYECEK.map((m) => <List.Item key={m}>{m}</List.Item>)}</List>
              </Paper>
              <Paper withBorder p="md" radius="md">
                <Title order={4} mb="xs">A3'teki kurum modeli</Title>
                <List size="sm" spacing={4}>{MCP_KURUM_MODELI.map((m) => <List.Item key={m}>{m}</List.Item>)}</List>
                <Text size="xs" c="dimmed" mt="xs">Kaynak: A3 §4</Text>
              </Paper>
            </SimpleGrid>
          </Stack>
        </Tabs.Panel>
      </Tabs>
    </Stack>
  );
}
