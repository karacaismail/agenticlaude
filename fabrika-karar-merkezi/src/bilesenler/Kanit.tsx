import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { Anchor, Badge, Button, Chip, Drawer, Group, Paper, ScrollArea, Select, Stack, Text, TextInput, ThemeIcon, Tooltip } from '@mantine/core';
import { IconCalendar, IconExternalLink, IconFileText, IconSearch, IconListDetails } from '@tabler/icons-react';
import { KANITLAR, KAYNAK_AD, TUR_ACIKLAMA, TUR_AD, TUR_RENK, TUR_SIRA, kanitAra, turSayilari, type Kanit } from '../veri/kanit';
import type { Olgu } from '../veri/tipler';

// ---------- Tek bulgu ----------
export function KanitOgesi({ k }: { k: Kanit }) {
  return (
    <div className="kanit-ogesi">
      <Group gap={8} mb={6} wrap="nowrap" align="flex-start">
        <Tooltip label={TUR_ACIKLAMA[k.tur]}><Badge size="sm" variant="light" color={TUR_RENK[k.tur]} style={{ flexShrink: 0 }}>{TUR_AD[k.tur] ?? k.tur}</Badge></Tooltip>
        <Text size="xs" c="dimmed" fw={600} lineClamp={2}>{k.baslik}</Text>
      </Group>
      <Text size="sm" className="kanit-metin">{k.metin}</Text>
      <Group gap={14} mt={8} className="kanit-meta" wrap="wrap">
        {k.tarih && <span><IconCalendar size={13} /> {k.tarih}</span>}
        <span><IconFileText size={13} /> {KAYNAK_AD[k.kod] ?? k.kod}</span>
        {k.dogrulama && <span>Doğrulama: {k.dogrulama}</span>}
        {k.url && <Anchor href={k.url} target="_blank" rel="noreferrer" size="xs">Kaynak <IconExternalLink size={12} /></Anchor>}
        {k.dosya && <Anchor href={`../${k.dosya}`} target="_blank" rel="noreferrer" size="xs">Araştırma dosyası</Anchor>}
        <span className="kanit-id">{k.id}</span>
      </Group>
    </div>
  );
}

// ---------- Süzgeçli liste ----------
export function KanitListesi({ liste, adim = 25, yukseklik }: { liste: Kanit[]; adim?: number; yukseklik?: number }) {
  const [turler, setTurler] = useState<string[]>([]);
  const [kaynak, setKaynak] = useState<string | null>(null);
  const [ara, setAra] = useState('');
  const [sinir, setSinir] = useState(adim);
  const sayilar = useMemo(() => turSayilari(liste), [liste]);
  const kaynaklar = useMemo(() => Array.from(new Set(liste.map((k) => k.kod))), [liste]);
  const suz = useMemo(() => {
    const q = ara.trim().toLocaleLowerCase('tr-TR');
    return liste.filter((k) => (!turler.length || turler.includes(k.tur)) && (!kaynak || k.kod === kaynak) &&
      (!q || `${k.baslik} ${k.metin} ${k.id}`.toLocaleLowerCase('tr-TR').includes(q)));
  }, [liste, turler, kaynak, ara]);
  const gorunen = suz.slice(0, sinir);
  const icerik = (
    <Stack gap="xs">
      {gorunen.map((k) => <KanitOgesi key={k.id} k={k} />)}
      {suz.length > sinir && <Button variant="subtle" onClick={() => setSinir((x) => x + adim)}>Daha fazla göster ({suz.length - sinir} kaldı)</Button>}
      {!suz.length && <Text size="sm" c="dimmed" py="md" ta="center">Bu süzgeçle bulgu yok.</Text>}
    </Stack>
  );
  return (
    <Stack gap="sm">
      <Group gap="xs" wrap="wrap">
        <TextInput size="xs" style={{ flex: '1 1 220px' }} placeholder="Bulgularda ara (ör. OOM, CVE, webhook)" leftSection={<IconSearch size={14} />} value={ara} onChange={(e) => { setAra(e.currentTarget.value); setSinir(adim); }} />
        <Select size="xs" w={210} placeholder="Kaynak dosya" clearable value={kaynak} onChange={(v) => { setKaynak(v); setSinir(adim); }}
          data={kaynaklar.map((k) => ({ value: k, label: KAYNAK_AD[k] ?? k }))} />
        <Text size="xs" c="dimmed" className="sonuc-sayisi"><b>{suz.length.toLocaleString('tr-TR')}</b> / {liste.length.toLocaleString('tr-TR')} bulgu</Text>
      </Group>
      <Chip.Group multiple value={turler} onChange={(v) => { setTurler(v); setSinir(adim); }}>
        <Group gap={6}>
          {sayilar.map(([t, n]) => (
            <Chip key={t} value={t} size="xs" color={TUR_RENK[t]} variant="light">
              <span className="tur-nokta" style={{ background: `var(--mantine-color-${TUR_RENK[t]}-6)` }} />{TUR_AD[t]} {n}
            </Chip>
          ))}
        </Group>
      </Chip.Group>
      {yukseklik ? <ScrollArea.Autosize mah={yukseklik} type="auto" offsetScrollbars>{icerik}</ScrollArea.Autosize> : icerik}
    </Stack>
  );
}

// ---------- Tür sayıları (satır içi özet) ----------
export function KanitSayilari({ liste, enFazla = 4 }: { liste: Kanit[]; enFazla?: number }) {
  const s = turSayilari(liste).slice(0, enFazla);
  if (!liste.length) return <Text size="xs" c="dimmed">Kaynaklarda bulgu yok</Text>;
  return (
    <Group gap={4} wrap="wrap">
      {s.map(([t, n]) => <Badge key={t} size="xs" variant="dot" color={TUR_RENK[t]}>{TUR_AD[t]} {n}</Badge>)}
    </Group>
  );
}

// ---------- Yan panel (her yerden açılır) ----------
interface Istek { baslik: string; alt?: string; etiketler?: string[]; liste?: Kanit[]; olgular?: Olgu[] }
const Baglam = createContext<{ kanitAc: (i: Istek) => void } | null>(null);
export const useKanit = () => {
  const b = useContext(Baglam);
  if (!b) throw new Error('KanitSaglayici eksik');
  return b;
};

export function KanitSaglayici({ children }: { children: ReactNode }) {
  const [istek, setIstek] = useState<Istek | null>(null);
  const liste = useMemo(() => (istek ? istek.liste ?? kanitAra(istek.etiketler ?? []) : []), [istek]);
  const deger = useMemo(() => ({ kanitAc: (i: Istek) => setIstek(i) }), []);
  return (
    <Baglam.Provider value={deger}>
      {children}
      <Drawer opened={!!istek} onClose={() => setIstek(null)} position="right" size="xl" padding="lg"
        title={<Group gap="sm" wrap="nowrap"><ThemeIcon variant="light" size="lg"><IconListDetails size={18} /></ThemeIcon><div><Text fw={700}>{istek?.baslik}</Text>{istek?.alt && <Text size="xs" c="dimmed">{istek.alt}</Text>}</div></Group>}>
        {istek && (
          <Stack gap="md">
            {!!istek.olgular?.length && (
              <Paper withBorder p="md" className="olgu-kutusu">
                <Text size="xs" fw={700} c="dimmed" tt="uppercase" mb={6} style={{ letterSpacing: '0.05em' }}>Öne çıkan olgular</Text>
                <OlguListesi olgular={istek.olgular} />
              </Paper>
            )}
            <KanitListesi key={istek.baslik} liste={liste} />
          </Stack>
        )}
      </Drawer>
    </Baglam.Provider>
  );
}

export function OlguListesi({ olgular, sinir }: { olgular: Olgu[]; sinir?: number }) {
  const l = sinir ? olgular.slice(0, sinir) : olgular;
  return (
    <ul className="olgu-listesi">
      {l.map((o, i) => (
        <li key={i}><Text size="sm" span>{o.metin}</Text> <Text size="xs" c="dimmed" span className="olgu-kaynak">{o.kaynak}</Text></li>
      ))}
    </ul>
  );
}

export const TOPLAM_KANIT = KANITLAR.length;
export const TUR_LISTESI = TUR_SIRA;
