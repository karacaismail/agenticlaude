import { useMemo, useRef, useState } from 'react';
import { Button, Code, CopyButton, Group, Paper, SegmentedControl, Stack, Text, Title, Collapse } from '@mantine/core';
import { SayfaBasligi } from '../bilesenler/SayfaBasligi';
import { IconCheck, IconCode, IconCopy, IconDownload } from '@tabler/icons-react';
import { useDurum, type NotGorunumu } from '../durum/depo';
import { useTuretilen } from '../durum/kanca';
import { tumDiyagramlar, type Diyagram } from '../diyagram/uretec';
import { MermaidGorunum } from '../diyagram/MermaidGorunum';
import { indir } from '../bilesenler/ortak';
import { AKTOR_RENK } from '../tema';
import { NOT_TURU } from '../veri/notlar';

// Lejant, diyagramdaki şekilleri küçük çizimlerle gösterir (renk tek başına anlam taşımaz).
type LejantSekli = 'stadyum' | 'kutu' | 'alt' | 'olay' | 'altigen' | 'not';
const AKTOR_LEJANT: Record<string, LejantSekli> = { insan: 'stadyum', ajan: 'kutu', deterministik: 'alt', olay: 'olay', karma: 'altigen' };
function Sekil({ tur, dolgu, kenar, kesik }: { tur: LejantSekli; dolgu: string; kenar: string; kesik?: boolean }) {
  const o = { fill: dolgu, stroke: kenar, strokeWidth: 1.6, strokeDasharray: kesik ? '3 2' : undefined };
  return (
    <svg width="30" height="18" viewBox="0 0 30 18" aria-hidden className="lejant-sekil">
      {tur === 'stadyum' && <rect x="1" y="2" width="28" height="14" rx="7" {...o} />}
      {tur === 'kutu' && <rect x="1" y="2" width="28" height="14" rx="2" {...o} />}
      {tur === 'alt' && <><rect x="1" y="2" width="28" height="14" rx="1" {...o} /><path d="M5 2V16M25 2V16" stroke={kenar} strokeWidth="1.2" /></>}
      {tur === 'olay' && <path d="M1 2H29V16H1L6 9Z" {...o} />}
      {tur === 'altigen' && <path d="M6 2H24L29 9L24 16H6L1 9Z" {...o} />}
      {tur === 'not' && <path d="M7 1.5H21L25 5.5V16.5H7Z" transform="rotate(-5 16 9)" {...o} />}
    </svg>
  );
}
export function Lejant() {
  return (
    <div className="lejant" aria-label="Lejant">
      <span className="lejant-baslik">Lejant</span>
      {Object.entries(AKTOR_RENK).map(([k, a]) => <span key={k} className="lejant-ogesi"><Sekil tur={AKTOR_LEJANT[k] ?? 'kutu'} dolgu={a.dolgu} kenar={a.kenar} />{a.ad}</span>)}
      <span className="lejant-ogesi"><Sekil tur="kutu" dolgu="#fff9db" kenar="#f08c00" kesik />Bekleme</span>
      <span className="lejant-ogesi"><Sekil tur="kutu" dolgu="#fff5f5" kenar="#e03131" />Hata / ret</span>
      <span className="lejant-ogesi"><Sekil tur="kutu" dolgu="#f1f3f5" kenar="#adb5bd" kesik />Kapalı adım</span>
      {Object.values(NOT_TURU).map((n) => <span key={n.ad} className="lejant-ogesi"><Sekil tur="not" dolgu={n.dolgu} kenar={n.kenar} />Not: {n.ad}</span>)}
    </div>
  );
}

function DiyagramKarti({ d, dosyaOn }: { d: Diyagram; dosyaOn: string }) {
  const svgRef = useRef<string>('');
  const [kod, setKod] = useState(false);
  const [boyut, setBoyut] = useState('sigdir');
  return (
    <Paper withBorder p="md" radius="md">
      <Group justify="space-between" align="flex-start" mb="xs">
        <div>
          <Title order={3}>{d.baslik}</Title>
          <Text size="sm" c="dimmed">{d.aciklama}</Text>
        </div>
        <Group gap="xs">
          <SegmentedControl size="xs" value={boyut} onChange={setBoyut} data={[{ label: 'Sığdır', value: 'sigdir' }, { label: 'Gerçek boyut', value: 'gercek' }]} />
          <Button size="xs" variant="default" leftSection={<IconDownload size={14} />} onClick={() => svgRef.current && indir(`${dosyaOn}-${d.id}.svg`, svgRef.current, 'image/svg+xml')}>SVG</Button>
          <Button size="xs" variant="default" leftSection={<IconDownload size={14} />} onClick={() => indir(`${dosyaOn}-${d.id}.mmd`, d.kod)}>Mermaid</Button>
          {d.d2 && <Button size="xs" variant="default" leftSection={<IconDownload size={14} />} onClick={() => indir(`${dosyaOn}-${d.id}.d2`, d.d2!)}>D2</Button>}
          <Button size="xs" variant="subtle" leftSection={<IconCode size={14} />} onClick={() => setKod((x) => !x)}>{kod ? 'Kodu gizle' : 'Kodu göster'}</Button>
        </Group>
      </Group>
      <Collapse in={kod}>
        <Stack gap={6} mb="sm">
          <Group justify="flex-end">
            <CopyButton value={d.kod}>{({ copied, copy }) => <Button size="compact-xs" variant="light" leftSection={copied ? <IconCheck size={12} /> : <IconCopy size={12} />} onClick={copy}>{copied ? 'Kopyalandı' : 'Mermaid kodunu kopyala'}</Button>}</CopyButton>
            {d.d2 && <CopyButton value={d.d2}>{({ copied, copy }) => <Button size="compact-xs" variant="light" leftSection={copied ? <IconCheck size={12} /> : <IconCopy size={12} />} onClick={copy}>{copied ? 'Kopyalandı' : 'D2 kodunu kopyala'}</Button>}</CopyButton>}
          </Group>
          <Code block className="kod-blok">{d.kod}</Code>
        </Stack>
      </Collapse>
      <MermaidGorunum kod={d.kod} notlar={d.notlar} gercek={boyut === 'gercek'} onSvg={(s) => { svgRef.current = s; }} />
    </Paper>
  );
}

export function Diyagramlar() {
  const { durum, gonder } = useDurum();
  const t = useTuretilen();
  const diyagramlar = useMemo(() => tumDiyagramlar(durum, t), [durum, t]);
  return (
    <Stack gap="lg" className="sayfa">
      <SayfaBasligi ust="Çıktı" baslik="Diyagramlar" aciklama="Senaryo ve kararlarına göre anında yeniden çizilir. Yapışkan notlar Kestra pilotunda, dünyada ve Codex incelemesinde görülen sorunu ve bağlı kuralın açık ya da kapalı olduğunu gösterir. D2 kaynağını çizmek için: d2 dosya.d2 dosya.svg" />
      <Paper withBorder p="sm" radius="md">
        <Group gap="lg" wrap="wrap">
          <Group gap="xs">
            <Text size="sm" fw={600}>Görünüm</Text>
            <SegmentedControl size="xs" value={String(durum.kararlar.gorunum)} onChange={(v) => gonder({ tur: 'karar', id: 'gorunum', deger: v })}
              data={[{ label: 'Kümeler', value: 'kume' }, { label: 'Ana bölümler', value: 'bolum' }, { label: 'Kümesiz', value: 'kumesiz' }]} />
          </Group>
          <Group gap="xs">
            <Text size="sm" fw={600}>Notlar</Text>
            <SegmentedControl size="xs" value={durum.notGorunumu} onChange={(v) => gonder({ tur: 'not', gorunum: v as NotGorunumu })}
              data={[{ label: 'Hepsi', value: 'hepsi' }, { label: 'Yalnız açık riskler', value: 'acik-riskler' }, { label: 'Gizle', value: 'gizli' }]} />
          </Group>
        </Group>
        <div style={{ marginTop: 10 }}><Lejant /></div>
      </Paper>
      {diyagramlar.map((d) => <DiyagramKarti key={d.id} d={d} dosyaOn={durum.senaryoId} />)}
    </Stack>
  );
}
