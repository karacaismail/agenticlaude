import { useMemo } from 'react';
import { AppShell, Badge, Burger, Button, Group, Kbd, NavLink, ActionIcon, ScrollArea, Stack, Text, Tooltip, UnstyledButton, useComputedColorScheme, useMantineColorScheme, Progress } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { Spotlight, spotlight, type SpotlightActionGroupData } from '@mantine/spotlight';
import {
  IconCompass, IconAdjustmentsHorizontal, IconSitemap, IconAlertTriangle, IconStack2, IconRobot, IconFileText,
  IconChartBar, IconBooks, IconReport, IconSearch, IconSun, IconMoon, IconFileTypePdf, IconRoute, IconBolt, IconListSearch,
} from '@tabler/icons-react';
import { useSayfa } from './bilesenler/ortak';
import { useDurum } from './durum/depo';
import { useTuretilen } from './durum/kanca';
import { SENARYOLAR } from './veri/senaryolar';
import { KURALLAR } from './veri/kurallar';
import { SORUNLAR } from './veri/sorunlar';
import { BELGELER } from './veri/belgeler';
import { KARARLAR } from './veri/kararlar';
import { Baslangic } from './sayfalar/Baslangic';
import { Tasarimci } from './sayfalar/Tasarimci';
import { Diyagramlar } from './sayfalar/Diyagramlar';
import { Sorunlar } from './sayfalar/Sorunlar';
import { Teknolojiler } from './sayfalar/Teknolojiler';
import { AjanSkillMcp } from './sayfalar/AjanSkillMcp';
import { Belgeler } from './sayfalar/Belgeler';
import { Istatistikler } from './sayfalar/Istatistikler';
import { Kaynaklar } from './sayfalar/Kaynaklar';
import { Rapor } from './sayfalar/Rapor';
import { Kanitlar } from './sayfalar/Kanitlar';
import { KanitSaglayici } from './bilesenler/Kanit';
import { KANITLAR } from './veri/kanit';

const SAYFALAR = [
  { id: 'baslangic', grup: 'Karar', ad: 'Başla', alt: 'Öne çıkan bulgular', ikon: IconCompass, bilesen: Baslangic },
  { id: 'tasarimci', grup: 'Karar', ad: 'Senaryo tasarımcısı', alt: 'Kararlar, ECA kuralları, kümeler', ikon: IconAdjustmentsHorizontal, bilesen: Tasarimci },
  { id: 'kanitlar', grup: 'Kanıt', ad: 'Bulgular', alt: `${KANITLAR.length.toLocaleString('tr-TR')} kaynaklı kayıt`, ikon: IconListSearch, bilesen: Kanitlar },
  { id: 'sorunlar', grup: 'Kanıt', ad: 'Sorunlar ve önlemler', alt: 'Kestra, dünya, ön-ölüm', ikon: IconAlertTriangle, bilesen: Sorunlar },
  { id: 'teknolojiler', grup: 'Kanıt', ad: 'Teknolojiler', alt: 'Yığın, C1 matrisi, katalog', ikon: IconStack2, bilesen: Teknolojiler },
  { id: 'ajanlar', grup: 'Kanıt', ad: 'Ajan · Skill · MCP', alt: 'Roller, skill havuzu, MCP', ikon: IconRobot, bilesen: AjanSkillMcp },
  { id: 'istatistikler', grup: 'Kanıt', ad: 'İstatistikler', alt: 'Araştırmanın sayıları', ikon: IconChartBar, bilesen: Istatistikler },
  { id: 'diyagramlar', grup: 'Çıktı', ad: 'Diyagramlar', alt: 'Mermaid + D2, notlarla', ikon: IconSitemap, bilesen: Diyagramlar },
  { id: 'belgeler', grup: 'Çıktı', ad: 'Hazırlanacak dosyalar', alt: '.md şablonları', ikon: IconFileText, bilesen: Belgeler },
  { id: 'rapor', grup: 'Çıktı', ad: 'Rapor ve PDF', alt: 'Kararların ve dayanakları', ikon: IconReport, bilesen: Rapor },
  { id: 'kaynaklar', grup: 'Kaynak', ad: 'Kaynak dosyalar', alt: 'Araştırma ve panolar', ikon: IconBooks, bilesen: Kaynaklar },
];

export function App() {
  const [acik, { toggle, close }] = useDisclosure();
  const { sayfa, git } = useSayfa();
  const { durum, gonder } = useDurum();
  const t = useTuretilen();
  const { setColorScheme } = useMantineColorScheme();
  const sema = useComputedColorScheme('light', { getInitialValueInEffect: true });
  const aktifSayfa = SAYFALAR.find((s) => s.id === sayfa) ?? SAYFALAR[0];
  const Bilesen = aktifSayfa.bilesen;
  const oran = Math.round((t.kapsam.kapsanan / Math.max(1, t.kapsam.toplam)) * 100);
  const degisiklik = t.degisenKararlar.length + t.degisenKurallar.length;

  const aramalar = useMemo<SpotlightActionGroupData[]>(() => [
    { group: 'Sayfalar', actions: SAYFALAR.map((s) => ({ id: `s-${s.id}`, label: s.ad, description: s.alt, onClick: () => git(s.id) })) },
    { group: 'Senaryolar', actions: SENARYOLAR.map((s) => ({ id: `n-${s.id}`, label: s.ad, description: s.ozet, onClick: () => { gonder({ tur: 'senaryo', id: s.id }); git('tasarimci'); } })) },
    { group: 'Kararlar', actions: KARARLAR.map((k) => ({ id: `k-${k.id}`, label: k.baslik, description: k.soru, onClick: () => git(`tasarimci?sekme=kararlar&karar=${k.id}`) })) },
    { group: 'ECA kuralları', actions: KURALLAR.map((k) => ({ id: `r-${k.id}`, label: `${k.id} · ${k.baslik}`, description: `${k.olay} → ${k.eylem}`, onClick: () => git(`tasarimci?sekme=kurallar&kural=${k.id}`) })) },
    { group: 'Sorunlar', actions: SORUNLAR.map((s) => ({ id: `p-${s.id}`, label: `${s.id} · ${s.baslik}`, description: s.ozet, onClick: () => git(`sorunlar?id=${s.id}`) })) },
    { group: 'Dosyalar', actions: BELGELER.map((b) => ({ id: `b-${b.yol}`, label: b.yol, description: b.neIse, onClick: () => git(`belgeler?yol=${encodeURIComponent(b.yol)}`) })) },
  ], [git, gonder]);

  return (
    <KanitSaglayici>
      <AppShell header={{ height: 60 }} navbar={{ width: 280, breakpoint: 'sm', collapsed: { mobile: !acik } }} padding="lg">
        <AppShell.Header className="ekran-yalniz">
          <Group h="100%" px="md" justify="space-between" wrap="nowrap">
            <Group gap="sm" wrap="nowrap">
              <Burger opened={acik} onClick={toggle} hiddenFrom="sm" size="sm" aria-label="Menü" />
              <UnstyledButton onClick={() => git('baslangic')}>
                <Group gap={8} wrap="nowrap">
                  <IconRoute size={22} stroke={1.8} />
                  <Text fw={700} visibleFrom="xs">Fabrika Karar Merkezi</Text>
                </Group>
              </UnstyledButton>
              <Tooltip label="Etkin senaryo. Değiştirmek için Senaryo tasarımcısı.">
                <Badge variant="light" size="lg" radius="sm" visibleFrom="md" style={{ cursor: 'pointer' }} onClick={() => git('tasarimci')}>
                  {t.senaryo.ad}{degisiklik ? ` · ${degisiklik} değişiklik` : ''}
                </Badge>
              </Tooltip>
            </Group>
            <Group gap="xs" wrap="nowrap">
              <Button variant="default" size="xs" leftSection={<IconSearch size={14} />} onClick={() => spotlight.open()} rightSection={<Kbd size="xs" visibleFrom="sm">⌘K</Kbd>}>
                Ara
              </Button>
              <Button size="xs" leftSection={<IconFileTypePdf size={15} />} onClick={() => git('rapor?yazdir=1')}>PDF</Button>
              <Tooltip label={sema === 'dark' ? 'Açık tema' : 'Koyu tema'}>
                <ActionIcon variant="default" size="lg" aria-label="Tema" onClick={() => setColorScheme(sema === 'dark' ? 'light' : 'dark')}>
                  {sema === 'dark' ? <IconSun size={18} /> : <IconMoon size={18} />}
                </ActionIcon>
              </Tooltip>
            </Group>
          </Group>
        </AppShell.Header>

        <AppShell.Navbar p="xs" className="ekran-yalniz">
          <AppShell.Section grow component={ScrollArea}>
            <Stack gap={0}>
              {['Karar', 'Kanıt', 'Çıktı', 'Kaynak'].map((grup) => (
                <div key={grup} className="nav-grup">
                  <Text className="nav-grup-baslik">{grup}</Text>
                  {SAYFALAR.filter((s) => s.grup === grup).map((s) => (
                    <NavLink key={s.id} active={s.id === aktifSayfa.id} label={s.ad} description={s.alt} leftSection={<s.ikon size={18} stroke={1.6} />}
                      onClick={() => { git(s.id); close(); }} variant="light" className="nav-baglanti" />
                  ))}
                </div>
              ))}
            </Stack>
          </AppShell.Section>
          <AppShell.Section p="xs" className="nav-alt">
            <Stack gap={6}>
              <Group justify="space-between">
                <Tooltip label="Kataloglanan sorunlardan açık bir kurala ya da karara bağlı olanların oranı"><Text size="xs" fw={600}>Sorun bağlantısı</Text></Tooltip>
                <Text size="xs" c="dimmed">{t.kapsam.kapsanan}/{t.kapsam.toplam} · %{oran}</Text>
              </Group>
              <Progress value={oran} size="sm" color={oran >= 80 ? 'teal' : oran >= 50 ? 'yellow' : 'red'} aria-label="Sorun kapsamı" />
              <Group gap={6}>
                <IconBolt size={14} />
                <Text size="xs" c="dimmed">Faz {durum.hedefFaz} · {t.aktifKurallar.length}/{KURALLAR.length} kural açık</Text>
              </Group>
            </Stack>
          </AppShell.Section>
        </AppShell.Navbar>

        <AppShell.Main>
          <Bilesen />
        </AppShell.Main>
      </AppShell>
      <Spotlight actions={aramalar} nothingFound="Sonuç yok" highlightQuery limit={40} scrollable maxHeight={460}
        searchProps={{ leftSection: <IconSearch size={18} />, placeholder: 'Karar, kural, sorun, dosya, senaryo ara…' }} shortcut={['mod + K']} />
    </KanitSaglayici>
  );
}
