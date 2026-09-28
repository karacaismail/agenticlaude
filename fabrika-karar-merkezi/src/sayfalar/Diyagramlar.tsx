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

export function Lejant() {
  return (
    <div className="lejant">
      {Object.values(AKTOR_RENK).map((a) => (
        <span key={a.ad}><span className="ornek" style={{ background: a.dolgu, borderColor: a.kenar }} />{a.ad}</span>
      ))}
      <span><span className="ornek" style={{ background: '#fff9db', borderColor: '#f08c00', borderStyle: 'dashed' }} />Bekleme</span>
      <span><span className="ornek" style={{ background: '#fff5f5', borderColor: '#e03131' }} />Hata / ret</span>
      <span><span className="ornek" style={{ background: '#f1f3f5', borderColor: '#adb5bd', borderStyle: 'dashed' }} />Kapalı adım</span>
      {Object.values(NOT_TURU).map((n) => (
        <span key={n.ad}><span className="ornek" style={{ background: n.dolgu, borderColor: n.kenar, transform: 'rotate(-4deg)' }} />Not: {n.ad}</span>
      ))}
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
